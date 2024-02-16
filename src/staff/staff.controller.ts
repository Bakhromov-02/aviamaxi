import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateStaffDto, UpdateStaffDto } from './dto';
import { RolesEnum } from '../common/enums';
import { RolesGuard } from '../common/guards';
import { RequestUser } from '../common/interfaces';
import { StaffFilter } from '../common/filter-dtos';
import { RequiredRoles, User } from '../common/decorators';
import { Staff } from './entities/staff.entity';
import { StaffService } from './staff.service';

@UseGuards(RolesGuard)
@ApiTags('staff')
@ApiBearerAuth('JWT-auth')
@Controller('api/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @RequiredRoles(RolesEnum.ADMIN)
  @ApiCreatedResponse({ type: Staff })
  @Post()
  create(@Body() dto: CreateStaffDto, @User() user: RequestUser) {
    return this.staffService.create(dto, user);
  }

  @RequiredRoles(RolesEnum.ADMIN)
  // TODO add response object
  @Get()
  findAll(@User() user: RequestUser, @Query() query: StaffFilter) {
    return this.staffService.findAll(user, query);
  }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @ApiOkResponse({
    type: Staff
  })
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.staffService.findOne(+id, user);
  }

  @RequiredRoles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto, @User() user: RequestUser) {
    return this.staffService.update(+id, dto, user);
  }
}
