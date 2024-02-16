import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Client } from './entities/client.entity';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { ClientFilter } from '../common/filter-dtos';
import { RequiredRoles } from '../common/decorators';
import { DocumentTypeEnum, GenderEnum, RolesEnum } from '../common/enums';
import { RolesGuard } from '../common/guards';

@UseGuards(RolesGuard)
@RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
@ApiTags('client')
@ApiBearerAuth('JWT-auth')
@Controller('api/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  @ApiCreatedResponse({
    type: Client
  })
  @ApiOperation({
    description: `
    Document type: ${Object.values(DocumentTypeEnum)}
    Gender: ${Object.values(GenderEnum)}
    `
  })
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientService.create(dto);
  }

  @Get()
  findAll(@Query() query: ClientFilter) {
    return this.clientService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @Get('document/:document')
  findOneByDocument(@Param('document') document: string) {
    return this.clientService.findOneByDocument(document);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(+id, dto);
  }
}
