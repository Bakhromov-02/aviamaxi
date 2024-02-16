import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Not, QueryFailedError, Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { CreateStaffDto, UpdateStaffDto } from './dto';
import { RolesEnum } from '../common/enums';
import { RequestUser } from '../common/interfaces';
import { Staff } from './entities/staff.entity';
import { Role } from '../role/entities/role.entity';
import { Branch } from '../branch/entities/branch.entity';
import { StaffFilter } from 'src/common/filter-dtos';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private staffRepository: Repository<Staff>,
    private dataSource: DataSource,
  ) { }

  async create(dto: CreateStaffDto, user: RequestUser) {
    if (user.role === RolesEnum.ADMIN && user.branch !== dto.branch) {
      throw new ForbiddenException('You cannot add staff to other branch')
    }

    const isExists = await this.staffRepository
      .createQueryBuilder()
      .where({ phoneNumber: dto.phoneNumber })
      .getOne()

    if (isExists) {
      if (!isExists.isActive) {
        throw new BadRequestException('Staff with this phone number exists, but is not active')
      }
      throw new BadRequestException('Staff with this phone number exists')
    }

    const role = await this.dataSource.manager
      .createQueryBuilder(Role, 'role')
      .where({ id: dto.role })
      .getOne()

    if (!role) {
      throw new NotFoundException('Role with id not found')
    }

    const branch = await this.dataSource.manager
      .createQueryBuilder(Branch, 'branch')
      .where({ id: dto.branch })
      .getOne()

    if (!branch) {
      throw new NotFoundException('Branch with id not found')
    }

    const hashedPassword = await argon2.hash(dto.password);

    const staff = {
      phoneNumber: dto.phoneNumber,
      name: dto.name,
      isActive: dto.isActive,
      password: hashedPassword,
      role: { id: dto.role },
      branch: { id: dto.branch }
    }

    const createdStaff = await this.staffRepository
      .createQueryBuilder()
      .insert()
      .into(Staff)
      .values(staff)
      .returning('*')
      .execute()
      .then(result => result.raw[0])

    delete createdStaff.password;

    return createdStaff;
  }

  async findAll(user: RequestUser, query: StaffFilter) {
    const { branch, role } = user;
    const { isActive, name, page = 1, limit = 20 } = query;
    const staffQuery = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.branch', 'branch')
      .where(isActive !== undefined ? { isActive } : {})
      .andWhere(role === RolesEnum.ADMIN ? { branch: { id: branch } } : {})

    if (name) {
      staffQuery
        .andWhere('staff.name LIKE :name', { name: `%${name}%` })
    }

    const [staff, count] = await staffQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(count / limit);

    return { staff, totalPages, currentPage: page }
  }

  async findOne(id: number, user: RequestUser) {
    const { id: staffId, role, branch } = user;

    const staff = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.branch', 'branch') //TODO add orders here
      .where({ id })
      .getOne()

    if (!staff) {
      throw new NotFoundException('Staff with this id not found')
    }

    if (role === RolesEnum.ADMIN && branch !== staff.branch.id) {
      throw new UnauthorizedException('The admin of this branch cannot access other branchs\' staff')
    }

    if (role === RolesEnum.MANAGER && staffId !== staff.id) {
      throw new UnauthorizedException('The manager cannot acces other staff')
    }

    return staff;
  }

  async update(id: number, dto: UpdateStaffDto, user: RequestUser) {
    const { branch, isActive, name, password, phoneNumber, role } = dto;
    const { id: staffId, role: staffRole, branch: staffBranch } = user;

    const staff = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.branch', 'branch')
      .leftJoinAndSelect('staff.role', 'role')
      .where({ id })
      .getOne()

    if (!staff) {
      throw new NotFoundException('The staff with this id not found')
    }

    if (staffRole === RolesEnum.MANAGER && staffId !== id) {
      throw new UnauthorizedException('The manager cannot update other staff members')
    }

    if (staffRole === RolesEnum.ADMIN && staff.branch.id !== staffBranch) {
      throw new UnauthorizedException('The admin cannot update other branches staff members')
    }

    if (phoneNumber) {
      const isExists = await this.staffRepository
        .createQueryBuilder()
        .where({
          phoneNumber,
          id: Not(id)
        })
        .getOne()
      if (isExists) {
        throw new BadRequestException('Staff with this phone number exists')
      }
    }

    if (branch) {
      const isExists = await this.dataSource
        .createQueryBuilder(Branch, 'branch')
        .where({ id: branch })
        .getOne();
      if (!isExists) {
        throw new NotFoundException('Branch with this id not found')
      }
    }

    if (role) {
      const isExists = await this.dataSource
        .createQueryBuilder(Role, 'role')
        .where({ id: role })
        .getOne();
      if (!isExists) {
        throw new NotFoundException('Role with this id not found')
      }
    }

    const hashedPassword = password ? await argon2.hash(password) : staff.password;

    const staffValues = {
      phoneNumber: phoneNumber || staff.phoneNumber,
      name: name || staff.name,
      isActive: isActive || staff.isActive,
      password: hashedPassword,
      role: { id: role || staff.role.id },
      branch: { id: branch || staff.branch.id }
    }

    try {

      const updatedStaff = await this.staffRepository
        .createQueryBuilder()
        .update(Staff)
        .set(staffValues)
        .where({ id })
        .returning('*')
        .execute()
        .then(result => result.raw[0])

      delete updatedStaff.password;
      return updatedStaff;
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }
  }


}
