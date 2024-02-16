import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';

import { Card } from './entities/card.entity';
import { CreateCardDto, UpdateCardDto } from './dto';
import { CardFilter } from 'src/common/filter-dtos/card.filter.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>
  ) { }

  async create(dto: CreateCardDto) {
    const { name, number } = dto;
    const isExists = await this.cardRepository
      .createQueryBuilder()
      .where({ number: dto.number })
      .getOne()

    if (isExists) {
      throw new BadRequestException('Card with this number exists')
    }

    try {
      const createdCard = await this.cardRepository
        .createQueryBuilder()
        .insert()
        .into(Card)
        .values({
          name,
          number
        })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return createdCard;
    } catch (error) {
      console.log(error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }
    }
  }

  async findAll(query: CardFilter) {
    const { name, limit = 20, page = 1 } = query;
    const cardQuery = this.cardRepository
      .createQueryBuilder('card')

    if (name) {
      cardQuery
        .where('card.name LIKE :name', { name: `%${name}%` })
    }

    const [cards, count] = await cardQuery
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { cards, totalPages, currentPage: page }
  }

  async findOne(id: number) {
    const card = await this.cardRepository
      .createQueryBuilder()
      // TODO need to add relations with payment
      .where({ id })
      .getOne()

    if (!card) {
      throw new NotFoundException('The card with this id not found')
    }
    return card;
  }

  async update(id: number, dto: UpdateCardDto) {
    const { name, number } = dto;
    const card = await this.cardRepository
      .createQueryBuilder()
      .where({ id })
      .getOne()

    if (!card) {
      throw new NotFoundException("The card with this id not found")
    }

    const isExists = this.cardRepository
      .createQueryBuilder()
      .where({
        id: Not(id),
        number
      })
      .getOne()

    if (isExists) {
      throw new BadRequestException('The card with this number exists')
    }
    try {
      const updatedCard = await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ name, number })
        .where({ id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])
      return updatedCard;
    } catch (error) {
      console.log(error)

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }
  }


}
