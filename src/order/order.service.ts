import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto';
import { RequestUser } from '../common/interfaces';
import { OrderFilter } from '../common/filter-dtos/order.filter.dto';
import { RolesEnum, TicketTypeEnum } from 'src/common/enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>
  ) { }

  async create(dto: CreateOrderDto, user: RequestUser) {
    const { id } = user;

    try {
      const createOrder = await this.orderRepository
        .createQueryBuilder()
        .insert()
        .into(Order)
        .values({
          staff: { id }
        })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return createOrder
    } catch (error) {
      // TODO error handling
    }
  }

  async findAll(query: OrderFilter, user: RequestUser) {
    const {
      staff, branch, date, id, limit = 20, page = 1
    } = query;

    const { role, branch: branchId, id: staffId } = user;


    const orderQuery = this.orderRepository
      .createQueryBuilder('order')
      .loadRelationCountAndMap(
        'order.trainTicketCount',
        'order.ticket',
        'ticket', qb => {
          return qb.where({ type: TicketTypeEnum.TRAIN })
        })
      .loadRelationCountAndMap(
        'order.planeTicketCount',
        'order.ticket',
        'ticket', qb => {
          return qb.where({ type: TicketTypeEnum.PLANE })
        })
      .leftJoin('order.staff', 'staff')
      .leftJoin('staff.branch', 'branch')
      .where(id ? { id } : {})
      .andWhere(branch ? { staff: { branch: { id: branch } } } : {})
      .andWhere(staff ? { staff: { id: staff } } : {})
      .andWhere(role === RolesEnum.ADMIN ? { staff: { branch: { id: branchId } } } : {})
      .andWhere(role === RolesEnum.MANAGER ? { staff: { id: staffId } } : {})

    if (date) {
      if (isNaN(Date.parse(date))) {
        throw new BadRequestException('Invalid date');
      }

      const START = new Date(query.date).setHours(0, 0, 0, 0);
      const END = new Date(query.date).setHours(23, 59, 59, 59);

      orderQuery
        .andWhere({ createdAt: Between(START, END) })
    }

    const [orders, count] = await orderQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { orders, totalPages, currentPage: page }
  }

  async findOne(id: number, user: RequestUser) {
    const { role, id: staffId, branch } = user;
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.ticket', 'ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.branch', 'branch')
      .where({ id })
      .andWhere(role === RolesEnum.ADMIN ? { staff: { branch: { id: branch } } } : {})
      .andWhere(role === RolesEnum.MANAGER ? { staff: { id: staffId } } : {})
      .getOne();

    if (!order) {
      throw new NotFoundException('Order with this id not found')
    }

    return order;
  }
}
