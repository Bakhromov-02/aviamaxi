import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto, ReturnedTicketDto } from './dto';
import { RolesGuard } from '../common/guards';
import { RequiredRoles, User } from '../common/decorators';
import { RolesEnum, TicketTypeEnum } from '../common/enums';
import { RequestUser } from '../common/interfaces';
import { TicketFilter } from 'src/common/filter-dtos/ticket.filter.dto';

@UseGuards(RolesGuard)
@ApiTags('ticket')
@ApiBearerAuth('JWT-auth')
@Controller('api/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @ApiOperation({
    description: `
    Type: ${Object.values(TicketTypeEnum)}
    `
  })
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Get()
  findAll(@Query() query: TicketFilter) {
    return this.ticketService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.ticketService.findOne(+id, user);
  }

  @RequiredRoles(RolesEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @User() user: RequestUser) {
    return this.ticketService.update(+id, dto, user);
  }

  @RequiredRoles(RolesEnum.ADMIN)
  @Patch('return/:id')
  returnTicket(@Param('id') id: string, @Body() dto: ReturnedTicketDto, @User() user: RequestUser) {
    return this.ticketService.returnTicket(+id, dto, user);
  }

}
