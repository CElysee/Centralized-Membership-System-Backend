import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, IsEnum, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType, OwnershipType, CompanyStatus } from 'src/database/models/company.model';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'ABC Hotels Ltd',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number (TIN)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tin?: string;

  @ApiPropertyOptional({
    description: 'Business registration number',
    example: 'RW123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Company type',
    enum: CompanyType,
  })
  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @ApiPropertyOptional({
    description: 'Ownership type',
    enum: OwnershipType,
  })
  @IsOptional()
  @IsEnum(OwnershipType)
  ownershipType?: OwnershipType;

  @ApiPropertyOptional({
    description: 'Business activity sector',
    example: 'Hospitality and Tourism',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  activitySector?: string;

  @ApiPropertyOptional({
    description: 'Company website',
    example: 'https://www.abchotels.rw',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Number of permanent employees',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  permanentEmployees?: number;

  @ApiPropertyOptional({
    description: 'Number of part-time employees',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  partTimeEmployees?: number;

  @ApiPropertyOptional({
    description: 'Address data (JSON)',
    example: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Remera',
      cell: 'Rukiri I',
      village: 'Agatare',
      streetName: 'KG 123 St',
      poBox: 'P.O. Box 1234',
      specificLocation: 'Near UTC',
    },
  })
  @IsOptional()
  addressData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading hotel chain in Rwanda',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Company status',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}


