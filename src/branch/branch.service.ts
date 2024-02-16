import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';


import { Branch } from './entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { BranchFilter } from 'src/common/filter-dtos/branch.filter.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>
  ) {
  }

  async create(dto: CreateBranchDto) {
    const isExists = await this.branchRepository
      .createQueryBuilder()
      .where({ name: dto.name })
      .getOne()

    if (isExists) {
      throw new BadRequestException('Branch with this name already exists')
    }

    try {
      const createdBranch = await this.branchRepository
        .createQueryBuilder()
        .insert()
        .into(Branch)
        .values(dto)
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return createdBranch;
    } catch (error) {
      console.log(error)
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }
      throw error;
    }

  }

  async findAll(query: BranchFilter) {
    const { name, isActive, limit = 25, page = 1 } = query
    try {
      const branchQuery = this.branchRepository
        .createQueryBuilder('branch')
        // .leftJoin('branch.staff', 'staff')
        // .loadRelationCountAndMap('branch.staffCount', 'staffCount')
        .where(isActive !== undefined ? { isActive } : {})

      if (name) {
        branchQuery
          .andWhere('branch.name LIKE :name', { name: `%${name}%` })
      }

      const [branches, count] = await branchQuery
        .offset((page - 1) * limit) // skip should be used in case of getting relational data
        .limit(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(count / limit);

      return { branches, totalPages, currentPage: page }
    } catch (error) {
      console.log(error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }
      throw error;
    }
  }


  async update(id: number, dto: UpdateBranchDto) {
    const { name, isActive } = dto;

    const branch = await this.branchRepository
      .createQueryBuilder()
      .where({ id })
      .getOne()

    if (!branch) {
      throw new NotFoundException('Branch with this id not found')
    }

    const isExists = await this.branchRepository
      .createQueryBuilder()
      .where({
        id: Not(id),
        name
      })

    if (isExists) {
      throw new BadRequestException('Branch with this name already exists')
    }

    try {
      const updatedBranch = await this.branchRepository
        .createQueryBuilder()
        .update(Branch)
        .set({ name, isActive })
        .where({ id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      return updatedBranch;
    } catch (error) {
      console.log(error);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }
  }

}
