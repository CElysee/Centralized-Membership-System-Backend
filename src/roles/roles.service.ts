import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import Role from '../database/models/role.model';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto/role.dto';
import LoggerService from 'src/logger/logger.service';

@Injectable()
export default class RolesService {
  private readonly logger = new LoggerService('RolesService');

  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<RoleResponseDto[]> {
    this.logger.info('Fetching all roles');

    const roles = await this.roleModel.findAll({
      order: [['createdAt', 'ASC']],
    });

    return roles.map((role) => this.mapToResponse(role));
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<RoleResponseDto> {
    this.logger.info('Fetching role by ID', { roleId: id });

    const role = await this.roleModel.findByPk(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponse(role);
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    return await this.roleModel.findOne({ where: { name } });
  }

  /**
   * Create a new role
   */
  async createRole(dto: CreateRoleDto, createdBy?: string): Promise<RoleResponseDto> {
    this.logger.info('Creating new role', { roleName: dto.name });

    // Check if role with the same name already exists
    const existingRole = await this.roleModel.findOne({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = await this.roleModel.create({
      name: dto.name.toUpperCase(),
      displayName: dto.displayName,
      description: dto.description,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      isSystemRole: false, // Custom roles are not system roles
    } as any);

    this.logger.info('Role created successfully', { roleId: role.id, roleName: role.name });
    // this.logger.audit('ROLE_CREATED', {
    //   userId: createdBy,
    //   resourceId: role.id,
    //   resourceType: 'Role',
    //   status: 'SUCCESS',
    //   metadata: { roleName: role.name },
    // });

    return this.mapToResponse(role);
  }

  /**
   * Update a role
   */
  async updateRole(id: string, dto: UpdateRoleDto, updatedBy?: string): Promise<RoleResponseDto> {
    this.logger.info('Updating role', { roleId: id });

    const role = await this.roleModel.findByPk(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent updating system roles' name
    if (role.isSystemRole && dto.name && dto.name !== role.name) {
      throw new BadRequestException('Cannot change the name of a system role');
    }

    // Check if new name conflicts with existing role
    if (dto.name && dto.name !== role.name) {
      const existingRole = await this.roleModel.findOne({
        where: { name: dto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    const oldValue = { ...role.toJSON() };

    await role.update({
      name: dto.name ? dto.name.toUpperCase() : role.name,
      displayName: dto.displayName || role.displayName,
      description: dto.description !== undefined ? dto.description : role.description,
      isActive: dto.isActive !== undefined ? dto.isActive : role.isActive,
    });

    this.logger.info('Role updated successfully', { roleId: role.id });
    this.logger.audit('ROLE_UPDATED', {
      userId: updatedBy,
      resourceId: role.id,
      resourceType: 'Role',
      oldValue,
      newValue: role.toJSON(),
      status: 'SUCCESS',
    });

    return this.mapToResponse(role);
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string, deletedBy?: string): Promise<void> {
    this.logger.info('Deleting role', { roleId: id });

    const role = await this.roleModel.findByPk(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete a system role');
    }

    await role.destroy();

    this.logger.info('Role deleted successfully', { roleId: id });
    this.logger.audit('ROLE_DELETED', {
      userId: deletedBy,
      resourceId: id,
      resourceType: 'Role',
      status: 'SUCCESS',
      metadata: { roleName: role.name },
    });
  }

  /**
   * Map Role model to response DTO
   */
  private mapToResponse(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

