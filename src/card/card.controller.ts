import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { CardService } from './card.service';
import { Card } from './entities/card.entity';
import { CreateCardDto, UpdateCardDto } from './dto';
import { RolesGuard } from '../common/guards';
import { RequiredRoles } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { CardFilter } from 'src/common/filter-dtos/card.filter.dto';

@UseGuards(RolesGuard)
@ApiTags('card')
@ApiBearerAuth('JWT-auth')
@Controller('api/card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @ApiCreatedResponse({
    type: Card
  })
  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.cardService.create(dto);
  }

  @RequiredRoles()
  @Get()
  findAll(@Query() query: CardFilter) {
    return this.cardService.findAll(query);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardService.update(+id, dto);
  }
}
