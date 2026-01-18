import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import RolesService from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto/role.dto';
import { Roles, CurrentUser } from '../shared/decorators';
import { AuthenticatedUser } from '../shared/interfaces/request-context.interface';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export default class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'ASSOCIATION_MANAGER')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all roles',
    type: [RoleResponseDto],
  })
  async getAllRoles(): Promise<RoleResponseDto[]> {
    return await this.rolesService.getAllRoles();
  }

  @Get(':id')
  @Roles('SYSTEM_ADMIN', 'ASSOCIATION_MANAGER')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role details',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRoleById(@Param('id') id: string): Promise<RoleResponseDto> {
    return await this.rolesService.getRoleById(id);
  }

  @Post()
  // @Roles('SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.createRole(dto, user.sub);
  }

  @Put(':id')
  @Roles('SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify system role' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.updateRole(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system role' })
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.rolesService.deleteRole(id, user.sub);
  }
}

