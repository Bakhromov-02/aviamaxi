import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';


import { CreatePaymentToAgencyDto, UpdatePaymentToAgencyDto } from './dto';
import { RolesGuard } from '../common/guards';
import { RequiredRoles, User } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { RequestUser } from '../common/interfaces';
import { PaymentToAgencyService } from './payment-to-agency.service';
import { PaymentToAgency } from './entities/payment-to-agency.entity';
import { PaymentToAgencyFilter } from '../common/filter-dtos';

@UseGuards(RolesGuard)
@ApiTags('payment-to-agency')
@ApiBearerAuth('JWT-auth')
@Controller('api/payment-to-agency')
export class PaymentToAgencyController {
  constructor(private readonly paymentToAgencyService: PaymentToAgencyService) { }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @ApiCreatedResponse({
    type: PaymentToAgency
  })
  @Post()
  create(@Body() dto: CreatePaymentToAgencyDto, @User() user: RequestUser) {
    return this.paymentToAgencyService.create(dto, user);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get()
  findAll(@Query() query: PaymentToAgencyFilter) {
    return this.paymentToAgencyService.findAll(query);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentToAgencyService.findOne(+id);
  }


  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentToAgencyDto) {
    return this.paymentToAgencyService.update(+id, dto);
  }
}
