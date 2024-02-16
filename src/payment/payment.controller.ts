import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';


import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { PaymentService } from './payment.service';
import { RolesGuard } from '../common/guards';
import { RequiredRoles, User } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { RequestUser } from '../common/interfaces';
import { Pagination } from '../common/filter-dtos';
import { Payment } from './entities/payment.entity';

@UseGuards(RolesGuard)
@ApiTags('payment')
@ApiBearerAuth('JWT-auth')
@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @ApiCreatedResponse({
    type: Payment
  })
  @Post()
  create(@Body() dto: CreatePaymentDto, @User() user: RequestUser) {
    return this.paymentService.create(dto, user);
  }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @Get()
  findAll(@Query() query: Pagination, @User() user: RequestUser) {
    return this.paymentService.findAll(query, user);
  }

  @RequiredRoles(RolesEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto, @User() user: RequestUser) {
    return this.paymentService.update(+id, dto, user);
  }

}
