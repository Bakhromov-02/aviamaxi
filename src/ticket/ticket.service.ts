import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto, ReturnedTicketDto, UpdateTicketDto } from './dto';
import { Client } from '../client/entities/client.entity';
import { Agency } from '../agency/entities/agency.entity';
import { Order } from '../order/entities/order.entity';
import { TicketFilter } from '../common/filter-dtos/ticket.filter.dto';
import { RequestUser } from '../common/interfaces';
import { RolesEnum } from 'src/common/enums';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private dataSource: DataSource,
  ) { }

  async create(dto: CreateTicketDto) {
    const {
      client, clientId,
      agency: agencyId, type,
      from, to,
      flightNumber, number, date,
      price, profit,
      comment, status,
      order: orderId
    } = dto;
    let newClientId: number;
    let createdTicket: Ticket;

    const order = await this.dataSource
      .createQueryBuilder(Order, 'order')
      .where({ id: orderId })
      .getOne()

    if (!order) {
      throw new NotFoundException('Order with this id not found')
    }

    const agency = await this.dataSource
      .createQueryBuilder(Agency, 'agency')
      .where({ id: agencyId })
      .getOne()

    if (!agency) {
      throw new NotFoundException('Agency with this id not found')
    }

    if (clientId) {
      const existingClient = await this.dataSource
        .createQueryBuilder(Client, 'client')
        .where({ id: clientId })
        .getOne()

      if (!existingClient) {
        throw new NotFoundException('Client with this id not found')
      }
    } else {
      const createdClient = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Client)
        .values(client)
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      newClientId = createdClient.id;
    }

    try {
      await this.dataSource.transaction(async manager => {
        const ticketValues = {
          client: { id: clientId || newClientId },
          order: { id: orderId },
          agency: { id: agencyId },
          type, from, to,
          price, profit,
          flightNumber, date, number,
          comment, status
        }

        createdTicket = await manager
          .createQueryBuilder()
          .insert()
          .into(Ticket)
          .values(ticketValues)
          .returning('*')
          .execute()
          .then((result) => result.raw[0]);

        agency.debit -= price;
        await manager.save(agency)

        order.totalPrice += price;
        order.totalProfit += profit;
        await manager.save(order)
      })
      return createdTicket;
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }
      throw error;
    }
  }

  async findAll(query: TicketFilter) {
    const { agency, branch, client, id, staff, limit = 20, page = 1 } = query;

    const [tickets, count] = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('ticket.agency', 'agency')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('order.staff', 'staff')
      .where(id ? { id } : {})
      .andWhere(agency ? { agency: { id: agency } } : {})
      .andWhere(staff ? { order: { staff: { id: staff } } } : {})
      .andWhere(branch ? { order: { staff: { branch: { id: branch } } } } : {})
      .andWhere(client ? { client: { id: client } } : {})
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { tickets, totalPages, currentPage: page }
  }

  async findOne(id: number, user: RequestUser) {
    const ticket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoin('ticket.order', 'order')
      .leftJoinAndSelect('order.staff', 'staff')
      .where({ id })
      .getOne()

    if (!ticket) {
      throw new NotFoundException('Ticket with this id not found')
    }

    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto, user: RequestUser) {
    const {
      client, clientId,
      agency: agencyId, type,
      from, to,
      flightNumber, number, date,
      price, profit,
      comment, status
    } = dto;
    const { role, branch } = user;
    let agency: Agency;
    let updatedTicket: Ticket;

    const ticket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.branch', 'branch')
      .leftJoinAndSelect('ticket.agency', 'agency')
      .leftJoinAndSelect('ticket.client', 'client')
      .where({ id })
      .getOne()

    if (!ticket) {
      throw new NotFoundException('Ticket with this id not found')
    }

    

    if (role !== RolesEnum.SUPERADMIN && branch !== ticket.order.staff.branch.id) {

    }

    if (agencyId && agencyId !== ticket.agency.id) {
      agency = await this.dataSource
        .createQueryBuilder(Agency, 'agency')
        .where({ id: agencyId })
        .getOne()

      if (!agency) {
        throw new NotFoundException('Agency with this id not found')
      }
    }

    try {
      if (client && clientId) {
        const clientQuery = this.dataSource.createQueryBuilder(Client, 'client')
        const existingClient = await clientQuery
          .where({ id: clientId })
          .getOne()

        if (!existingClient) {
          throw new NotFoundException('Client with this id not found')
        }

        await clientQuery
          .update(Client)
          .set(client)
          .where({ id: clientId })
          .returning('*')
          .execute()
          .then(result => result.raw[0])
      }

      console.log(clientId, clientId || ticket?.client?.id);

      await this.dataSource.transaction(async manager => {

        const ticketValues = {
          client: { id: clientId || ticket?.client?.id },
          agency: { id: agency?.id || ticket?.agency?.id },
          type, from, to,
          price, profit,
          flightNumber, date, number,
          comment, status
        }

        if (agency) {
          // previous agency
          ticket.agency.debit += ticket.price;
          await manager.save(ticket.agency);

          // new agency
          agency.debit -= price;
          await manager.save(agency);
        }

        ticket.order.totalPrice += price - (ticket.price || 0);
        ticket.order.totalProfit += profit - (ticket.profit || 0);

        await manager.save(ticket.order);


        updatedTicket = await manager
          .createQueryBuilder()
          .update(Ticket)
          .set(ticketValues)
          .where({ id })
          .returning('*')
          .execute()
          .then(result => result.raw[0])

      })
      return updatedTicket;
    } catch (error) {
      console.log(error);
      // TODO Error handling;
      throw error;
    }

  }


  async returnTicket(id: number, dto: ReturnedTicketDto, user: RequestUser) {
    const { returned } = dto;
    const { } = user;

    const ticket = await this.ticketRepository
      .createQueryBuilder()
      .where({ id })
      .getOne();
  }

}
