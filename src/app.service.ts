import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as argon2 from 'argon2'

import { RolesEnum } from './common/enums';
import { Role } from './role/entities/role.entity';
import { Staff } from './staff/entities/staff.entity';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
  ) { }

  async onApplicationBootstrap() {
    const isExists = await this.dataSource.manager
      .createQueryBuilder(Role, 'role')
      .where({ name: RolesEnum.SUPERADMIN })
      .getOne()

    if (isExists) return;

    const roles = [
      {
        name: RolesEnum.SUPERADMIN,
        description: 'Can manage everything'
      },
      {
        name: RolesEnum.ADMIN,
        description: 'Admin of branch'
      },
      {
        name: RolesEnum.MANAGER,
        description: 'Only can service the clients'
      },
    ]

    const hash = await argon2.hash('superadmin')

    const staff = {
      phoneNumber: '+998991234567',
      name: 'superadmin',
      password: hash,
    }

    try {
      await this.dataSource.manager.transaction(async manager => {
        const createdRoles = await manager
          .createQueryBuilder()
          .insert()
          .into(Role)
          .values(roles)
          .returning('*')
          .execute()
          .then(result => result.raw)

        const superadmin = createdRoles.filter(role => role.name === RolesEnum.SUPERADMIN)

        staff['role'] = { id: superadmin[0].id }

        await manager
          .createQueryBuilder()
          .insert()
          .into(Staff)
          .values(staff)
          .returning('*')
          .execute()
      })
      console.log('Superadmin and roles created successfully');
    } catch (error) {
      console.log(error.message);

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(error.message)
      }

      throw error;
    }

  }
}
