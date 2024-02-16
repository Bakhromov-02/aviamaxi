import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { RequestUser } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { DataSource, Repository } from 'typeorm';
import { Pagination } from 'src/common/filter-dtos';
import { RolesEnum } from 'src/common/enums';
import { Card } from 'src/card/entities/card.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private dataSource: DataSource
  ) { }

  async create(dto: CreatePaymentDto, user: RequestUser) {
    const { amount, card: cardId, type, comment } = dto;
    const { id } = user;

    const card = await this.dataSource
      .createQueryBuilder(Card, 'card')
      .where({ id: cardId })
      .getOne()

    if (!card) {
      throw new NotFoundException('The card with this id not found')
    }

    const values = {
      amount,
      type,
      comment,
      card: { id: cardId },
      staff: { id: id }
    }

    try {
      const createdPayment = await this.paymentRepository
        .createQueryBuilder()
        .insert()
        .into(Payment)
        .values(values)
        .returning('*')
        .execute()
        .then(result => result.raw[0])
      return createdPayment
    } catch (error) {
      // TODO central error handling
      console.log(error)
    }
  }

  async findAll(query: Pagination, user: RequestUser) {
    const { limit = 20, page = 1 } = query;
    const { id, role, branch } = user;
    const [payment, count] = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.staff', 'staff')
      .where(role === RolesEnum.MANAGER ? { staff: { id } } : {})
      .andWhere(role === RolesEnum.ADMIN ? { staff: { branch: { id: branch } } } : {})
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { payment, totalPages, currentPage: page }
  }

  async update(id: number, dto: UpdatePaymentDto, user: RequestUser) {
    const { amount, card, comment, type } = dto;
    const { id: staffId, role, branch } = user;

    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.staff', 'staff')
      .leftJoinAndSelect('payment.card', 'card')
      .where({ id })
      .getOne()

    if (!payment) {
      throw new NotFoundException('The payment with this id not found')
    }

    if (card !== payment.card.id) {
      const isExists = await this.dataSource.manager
        .createQueryBuilder(Card, 'card')
        .where({ id: card })
        .getOne()

      if (!isExists) {
        throw new NotFoundException('The card with this id not found')
      }
    }

    if (role === RolesEnum.ADMIN && payment.staff.branch.id !== branch) {
      throw new UnauthorizedException('Admin cannot update other branches\' payment')
    }

    const values = {
      amount: amount || payment.amount,
      type: type || payment.type,
      comment: comment || payment.comment,
      card: { id: card || payment.card.id },
      staff: { id: staffId }
    }

    try {
      const updatedPayment = await this.paymentRepository
        .createQueryBuilder()
        .update(Payment)
        .set(values)
        .where({ id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return updatedPayment;
    } catch (error) {
      // TODO add error handling
    }

  }

}
