import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { RequiredRoles, User } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { RequestUser } from '../common/interfaces';
import { OrderFilter } from '../common/filter-dtos/order.filter.dto';

@UseGuards(RolesGuard)
@ApiTags('order')
@ApiBearerAuth('JWT-auth')
@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @Post()
  create(@Body() dto: CreateOrderDto, @User() user: RequestUser) {
    return this.orderService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: OrderFilter, @User() user: RequestUser) {
    return this.orderService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.orderService.findOne(+id, user);
  }
}
