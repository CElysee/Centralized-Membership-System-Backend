import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import User from '../database/models/user.model';
import Role from '../database/models/role.model';
import UserRole from '../database/models/user-role.model';
import { ManageUserRoleDto, RoleOperation, UserResponseDto } from './dto/user.dto';
import LoggerService from 'src/logger/logger.service';

@Injectable()
export default class UsersService {
  private readonly logger = new LoggerService('UsersService');

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(UserRole)
    private userRoleModel: typeof UserRole,
  ) {}

  /**
   * Get user by ID with roles
   */
  async getUserById(id: string): Promise<UserResponseDto> {
    this.logger.info('Fetching user by ID', { userId: id });

    const user = await this.userModel.findByPk(id, {
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user);
  }

  /**
   * Manage user roles (add or remove)
   */
  async manageUserRole(
    dto: ManageUserRoleDto,
    performedBy: string,
  ): Promise<UserResponseDto> {
    this.logger.info('Managing user role', {
      userId: dto.userId,
      roleName: dto.roleName,
      operation: dto.operation,
    });

    // Verify user exists
    const user = await this.userModel.findByPk(dto.userId, {
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify role exists
    const role = await this.roleModel.findOne({
      where:{
        name: dto.roleName
      }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.isActive) {
      throw new BadRequestException('Cannot assign inactive role');
    }

    if (dto.operation === RoleOperation.ADD) {
      await this.addRoleToUser(user, role, performedBy);
    } else if (dto.operation === RoleOperation.REMOVE) {
      await this.removeRoleFromUser(user, role, performedBy);
    }

    // Reload user with updated roles
    await user.reload({
      include: [{ model: Role, through: { attributes: [] } }],
    });

    return this.mapToResponse(user);
  }

  /**
   * Add a role to a user
   */
  private async addRoleToUser(
    user: User,
    role: Role,
    performedBy: string,
  ): Promise<void> {
    // Check if user already has this role
    const existingUserRole = await this.userRoleModel.findOne({
      where: { userId: user.id, roleId: role.id },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    await this.userRoleModel.create({
      userId: user.id,
      roleId: role.id,
      assignedBy: performedBy,
    } as any);

    this.logger.info('Role added to user', {
      userId: user.id,
      roleId: role.id,
      roleName: role.name,
    });

    this.logger.audit('USER_ROLE_ADDED', {
      userId: performedBy,
      resourceId: user.id,
      resourceType: 'User',
      status: 'SUCCESS',
      metadata: {
        targetUserId: user.id,
        roleId: role.id,
        roleName: role.name,
      },
    });
  }

  /**
   * Remove a role from a user
   */
  private async removeRoleFromUser(
    user: User,
    role: Role,
    performedBy: string,
  ): Promise<void> {
    const userRole = await this.userRoleModel.findOne({
      where: { userId: user.id, roleId: role.id },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await userRole.destroy();

    this.logger.info('Role removed from user', {
      userId: user.id,
      roleId: role.id,
      roleName: role.name,
    });

    this.logger.audit('USER_ROLE_REMOVED', {
      userId: performedBy,
      resourceId: user.id,
      resourceType: 'User',
      status: 'SUCCESS',
      metadata: {
        targetUserId: user.id,
        roleId: role.id,
        roleName: role.name,
      },
    });
  }

  /**
   * Map User model to response DTO
   */
  private mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.fullName.split(" ")[0],
      lastName: user.fullName.split(" ")[1],
      dateOfBirth: user.dateOfBirth,
      nationalId: user.nationalId,
      address: user.address,
      city: user.city,
      country: user.country,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive!,
      roles: user.roles?.map((role) => role.name) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

