import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssociationStatus, AssociationType } from 'src/database/models/association.model';

export class CreateAssociationDto {
  @ApiProperty({
    description: 'Association name',
    example: 'Rwanda Hotel and Tourism Association',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Unique association code',
    example: 'RHTA',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    description: 'Association description',
    example: 'Professional association for hospitality industry',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'info@rhta.rw',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Contact phone',
    example: '+250788123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Physical address',
    example: 'KG 123 St, Kigali',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://www.rhta.rw',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Association status',
    enum: AssociationStatus,
    default: AssociationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AssociationStatus)
  status?: AssociationStatus;

  @ApiProperty({
    description: 'Type of members this association accepts',
    enum: AssociationType,
    example: AssociationType.BOTH,
  })
  @IsEnum(AssociationType)
  @IsNotEmpty()
  type: AssociationType;

  @ApiPropertyOptional({
    description: 'Additional settings (JSON)',
    example: { allowPublicRegistration: true, requireApproval: true },
  })
  @IsOptional()
  settings?: Record<string, any>;
}

