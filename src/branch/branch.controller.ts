import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';


import { CreateBranchDto, UpdateBranchDto } from './dto';
import { BranchService } from './branch.service';
import { RolesGuard } from '../common/guards';
import { RequiredRoles } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { BranchFilter } from '../common/filter-dtos/branch.filter.dto';
import { Branch } from './entities/branch.entity';

@UseGuards(RolesGuard)
@ApiTags('branch')
@ApiBearerAuth('JWT-auth')
@Controller('api/branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @ApiCreatedResponse({ type: Branch })
  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get()
  findAll(@Query() query: BranchFilter) {
    return this.branchService.findAll(query);
  }

  @RequiredRoles(RolesEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(+id, dto);
  }
}
