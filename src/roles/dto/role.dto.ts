import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'CONTENT_MANAGER',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Display name for the role',
    example: 'Content Manager',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Manages content creation and publication',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Is the role active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for updating a role
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

/**
 * Response DTO for role information
 */
export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID' })
  id: string;

  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Display name' })
  displayName: string;

  @ApiPropertyOptional({ description: 'Role description' })
  description?: string;

  @ApiProperty({ description: 'Is role active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is system role (cannot be deleted)' })
  isSystemRole: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

