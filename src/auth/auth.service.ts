import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2'

import { AuthUserDto } from './dto';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private dataSource: DataSource
    ) {
    }

    async login(dto: AuthUserDto) {
        const staff = await this.validateUser(dto);
        const jwt = await this.getToken(staff);

        const payload = {
            id: staff.id,
            name: staff.name,
            phoneNumber: staff.phoneNumber,
            token: jwt,
            role: staff.role.name
        }

        return payload;
    }

    async validateUser(dto: AuthUserDto) {
        const staff = await this.dataSource.manager
            .createQueryBuilder(Staff, 'staff')
            .leftJoinAndSelect('staff.role', 'role')
            .leftJoinAndSelect('staff.branch', 'branch')
            .addSelect('staff.password')
            .where({ phoneNumber: dto.phoneNumber })
            .getOne()

        const passwordEquals = await argon2.verify(staff.password, dto.password)

        if (staff && passwordEquals) {
            return staff;
        }

        throw new UnauthorizedException({ message: "Wrong phone number or password" });
    }

    async getToken(staff: Staff) {
        const payload = {
            phoneNumber: staff.phoneNumber,
            name: staff.name,
            id: staff.id,
            role: staff.role.name,
            branch: staff.branch?.id
        }

        const jwt = await this.jwtService.signAsync(
            payload
        )

        return jwt;
    }
}
