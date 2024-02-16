import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AgencyService } from './agency.service';
import { RolesGuard } from '../common/guards';
import { RequiredRoles } from 'src/common/decorators';
import { RolesEnum } from 'src/common/enums';
import { Agency } from './entities/agency.entity';
import { AgencyFilter } from 'src/common/filter-dtos';
import { CreateAgencyDto, UpdateAgencyDto } from './dto';

@UseGuards(RolesGuard)
@ApiTags('agency')
@ApiBearerAuth('JWT-auth')
@Controller('api/agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) { }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @ApiCreatedResponse({
    type: Agency
  })
  @Post()
  create(@Body() dto: CreateAgencyDto) {
    return this.agencyService.create(dto);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get()
  findAll(@Query() query: AgencyFilter) {
    return this.agencyService.findAll(query);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(+id);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @ApiOkResponse({
    type: Agency
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgencyDto) {
    return this.agencyService.update(+id, dto);
  }
}
