import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { CreatePaymentToAgencyDto, UpdatePaymentToAgencyDto } from './dto';
import { RequestUser } from '../common/interfaces';
import { PaymentToAgencyFilter } from '../common/filter-dtos';
import { Agency } from '../agency/entities/agency.entity';
import { PaymentToAgency } from './entities/payment-to-agency.entity';

@Injectable()
export class PaymentToAgencyService {
  constructor(
    @InjectRepository(PaymentToAgency) private paymentToAgencyRepository: Repository<PaymentToAgency>,
    private dataSource: DataSource
  ) { }

  async create(dto: CreatePaymentToAgencyDto, user: RequestUser) {
    const { agency, amount, comment } = dto;
    const { id } = user;
    const agent = await this.dataSource.manager
      .createQueryBuilder(Agency, 'agency')
      .where({ id: agency })
      .getOne()

    if (!agent) {
      throw new NotFoundException('The agency with this id not found')
    }

    const payment = {
      comment,
      amount,
      agency: { id: agency },
      staff: { id }
    }

    try {
      const createdPayment = await this.paymentToAgencyRepository
        .createQueryBuilder()
        .insert()
        .into(PaymentToAgency)
        .values(payment)
        .returning('*')
        .execute()
        .then(result => result.raw[0]);

      agent.debit += amount;
      await agent.save();

      return createdPayment;
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }
      throw error;
    }
  }

  // TODO add relations if necessary
  async findAll(query: PaymentToAgencyFilter) {
    const { page = 1, limit = 20, agency } = query;
    const [payments, count] = await this.paymentToAgencyRepository
      .createQueryBuilder('payment')
      .where(agency ? { agency: { id: agency } } : {})
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { payments, totalPages, currentPage: page }
  }

  async findOne(id: number) {
    const payment = await this.paymentToAgencyRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.staff', 'staff')
      .where({ id })
      .getOne()

    if (!payment) {
      throw new NotFoundException('The payment with this id not found')
    }
    return payment;
  }

  async update(id: number, dto: UpdatePaymentToAgencyDto) {
    const { agency, amount, comment } = dto;
    const payment = await this.paymentToAgencyRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.agency', 'agency')
      .where({ id })
      .getOne()

    if (!payment) {
      throw new NotFoundException('The payment with this id not found')
    }

    try {
      if (agency !== payment.agency.id) {
        const updatedAgency = await this.dataSource
          .createQueryBuilder(Agency, 'agency')
          .where({ id: agency })
          .getOne();

        payment.agency.debit -= payment.amount;
        await payment.agency.save()

        updatedAgency.debit += amount;
        await updatedAgency.save()
      } else {
        const difference = amount - payment.amount;
        payment.agency.debit += difference;
        await payment.agency.save()
      }

      const updatedPayment = await this.paymentToAgencyRepository
        .createQueryBuilder()
        .update(PaymentToAgency)
        .set({ amount, comment, agency: { id: agency } })
        .where("id = :id", { id: id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return updatedPayment;
    } catch (error) {
      console.log(error)
    }
  }
}
