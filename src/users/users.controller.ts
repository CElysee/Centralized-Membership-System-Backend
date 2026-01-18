import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import UsersService from './users.service';
import { ManageUserRoleDto, UserResponseDto } from './dto/user.dto';
import { Roles, CurrentUser } from '../shared/decorators';
import { AuthenticatedUser } from '../shared/interfaces/request-context.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Roles('SYSTEM_ADMIN', 'ASSOCIATION_MANAGER')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details with roles',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.getUserById(id);
  }

  @Post('roles/manage')
  @Roles('SYSTEM_ADMIN', 'ASSOCIATION_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add or remove role from user' })
  @ApiResponse({
    status: 200,
    description: 'User role managed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 409, description: 'User already has role (add) or does not have role (remove)' })
  async manageUserRole(
    @Body() dto: ManageUserRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return await this.usersService.manageUserRole(dto, user.sub);
  }
}

