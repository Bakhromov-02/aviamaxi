import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleService } from './role.service';
import { RolesGuard } from '../common/guards';
import { RequiredRoles } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { Role } from './entities/role.entity';

@ApiTags('role')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('api/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  // @Post()
  // create(@Body() createRoleDto: CreateRoleDto) {
  //   return this.roleService.create(createRoleDto);
  // }

  @ApiOkResponse({
    type: Role,
    isArray: true,
  })
  @RequiredRoles(RolesEnum.SUPERADMIN)
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @RequiredRoles()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
  //   return this.roleService.update(+id, updateRoleDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roleService.remove(+id);
  // }
}
