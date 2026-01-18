import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { UserRoles } from 'src/shared';

/**
 * Operation type for user role management
 */
export enum RoleOperation {
  ADD = 'add',
  REMOVE = 'remove',
}

/**
 * DTO for managing user roles
 */
export class ManageUserRoleDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Role Name to add or remove',
    example: UserRoles.SYSTEM_ADMIN ,
  })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty({
    description: 'Operation to perform',
    enum: RoleOperation,
    example: RoleOperation.ADD,
  })
  @IsEnum(RoleOperation)
  @IsNotEmpty()
  operation: RoleOperation;
}

/**
 * Response DTO for user information
 */
export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'National ID' })
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @ApiPropertyOptional({ description: 'Country' })
  country?: string;

  @ApiProperty({ description: 'Email verified' })
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verified' })
  phoneVerified: boolean;

  @ApiProperty({ description: 'Account status' })
  isActive: boolean;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

