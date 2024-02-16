import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>
  ) {
  }

  // create(createRoleDto: CreateRoleDto) {
  //   return 'This action adds a new role';
  // }

  async findAll() {
    const roles = await this.roleRepository
      .createQueryBuilder()
      .getMany()
    return roles;
  }

  async findOne(id: number) {
    const role = await this.roleRepository
      .createQueryBuilder()
      .where({ id })
      .getOne()
    if (!role) {
      throw new NotFoundException('Role with this id not found')
    }
    return role;
  }

  // update(id: number, updateRoleDto: UpdateRoleDto) {
  //   return `This action updates a #${id} role`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} role`;
  // }
}
