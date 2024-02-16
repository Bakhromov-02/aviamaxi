import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Agency } from './entities/agency.entity';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { AgencyFilter } from 'src/common/filter-dtos';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency) private agencyRepository: Repository<Agency>
  ) { }

  async create(dto: CreateAgencyDto) {
    const isExists = await this.agencyRepository
      .createQueryBuilder()
      .where({ name: dto.name })
      .getOne()

    if (isExists) {
      if (!isExists.isActive) {
        throw new BadRequestException('The agency with this name exists, and is not active')
      }
      throw new BadRequestException('The agency with this name exists')
    }

    const createdAgency = await this.agencyRepository
      .createQueryBuilder()
      .insert()
      .into(Agency)
      .values(dto)
      .returning('*')
      .execute()
      .then(result => result.raw[0])
    return createdAgency;
  }

  async findAll(query: AgencyFilter) {
    const { name, isActive, limit = 25, page = 1 } = query

    try {
      const agencyQuery = this.agencyRepository
        .createQueryBuilder('agency')
        .where(isActive !== undefined ? { isActive } : {})

      if (name) {
        agencyQuery
          .andWhere('agency.name LIKE :name', { name: `%${name}%` })
      }

      const [agencies, count] = await agencyQuery
        .offset((page - 1) * limit) // skip should be used in case of getting relational data
        .limit(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(count / limit);

      return { agencies, totalPages, currentPage: page }
    } catch (error) {
      console.log(error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }
  }

  async findOne(id: number) {
    const agency = await this.agencyRepository
      .createQueryBuilder('agency')
      .leftJoinAndSelect('agency.payment', 'payment')
      // TODO add relations if necessary
      .where({ id })
      .getOne()

    if (!agency) {
      throw new NotFoundException('The agency with this id not found')
    }

    return agency;
  }

  async update(id: number, dto: UpdateAgencyDto) {
    const { name, isActive, } = dto;
    if (name) {
      const isExists = await this.agencyRepository
        .createQueryBuilder()
        .where({
          name,
          id: Not(id)
        })
        .getOne()

      if (isExists) {
        throw new BadRequestException('Agency with this name exists')
      }
    }

    try {
      const updatedAgency = await this.agencyRepository
        .createQueryBuilder()
        .update(Agency)
        .set({ name, isActive })
        .where({ id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return updatedAgency;
    } catch (error) {
      console.log(error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }
  }

}
