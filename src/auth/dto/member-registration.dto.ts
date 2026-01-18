import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  Matches,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DocumentType } from 'src/database/models/document.model';

/**
 * DTO for document upload information
 */
export class DocumentUploadDto {
  @ApiProperty({
    description: 'Type of document being uploaded',
    enum: DocumentType,
    example: DocumentType.NATIONAL_ID,
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @ApiProperty({
    description: 'File name as stored on server',
    example: 'uuid-nationalid.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'Original file name from user',
    example: 'my_national_id.pdf',
  })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({
    description: 'File path/URL where document is stored',
    example: '/uploads/documents/uuid-nationalid.pdf',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  @IsNotEmpty()
  fileSize: number;

  @ApiPropertyOptional({
    description: 'Document expiry date (for IDs, licenses, etc.)',
    example: '2030-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

/**
 * DTO for member registration (onboarding)
 * Used when a new member signs up and applies for membership
 */
export class MemberRegistrationDto {
  // Personal Information
  @ApiProperty({
    description: 'Full name of the member',
    example: 'Jean Pierre Habimana',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Full name can only contain letters, spaces, hyphens, and apostrophes',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'jeanpierre@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    description: 'Phone number with country code',
    example: '+250788123456',
  })
  @IsPhoneNumber(undefined, {
    message: 'Please provide a valid phone number with country code',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Password - min 8 chars with uppercase, lowercase, number, special char',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: '1199012345678901',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    example: 'MALE',
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'Education level',
    example: 'Bachelor Degree',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  educationLevel?: string;

  @ApiPropertyOptional({
    description: 'Working experience description',
    example: '5 years in hospitality management',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  workingExperience?: string;

  @ApiPropertyOptional({
    description: 'Specialization or area of expertise',
    example: 'Tour Guide',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Province',
    example: 'Kigali City',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({
    description: 'District',
    example: 'Gasabo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({
    description: 'Sector',
    example: 'Remera',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sector?: string;

  @ApiPropertyOptional({
    description: 'Cell',
    example: 'Rukiri I',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cell?: string;

  @ApiPropertyOptional({
    description: 'Village',
    example: 'Agatare',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  village?: string;

  @ApiPropertyOptional({
    description: 'Street name',
    example: 'KG 123 St',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  streetName?: string;

  @ApiPropertyOptional({
    description: 'PO Box',
    example: 'P.O. Box 1234 Kigali',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  poBox?: string;

  @ApiPropertyOptional({
    description: 'Specific location description',
    example: 'Near UTC building',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specificLocation?: string;

  // Association and Membership Type Selection
  @ApiProperty({
    description: 'UUID of the association to apply for membership',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Please provide a valid association ID' })
  @IsNotEmpty({ message: 'Association ID is required' })
  associationId: string;

  @ApiProperty({
    description: 'UUID of the membership type being applied for',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4', { message: 'Please provide a valid membership type ID' })
  @IsNotEmpty({ message: 'Membership type ID is required' })
  membershipTypeId: string;

  @ApiProperty({
    description: 'Application type',
    enum: ['INDIVIDUAL', 'CORPORATE'],
    example: 'INDIVIDUAL',
  })
  @IsEnum(['INDIVIDUAL', 'CORPORATE'])
  @IsNotEmpty()
  applicationType: string;

  // Company Information (for corporate applications)
  @ApiPropertyOptional({
    description: 'Company name (required for corporate applications)',
    example: 'ABC Hotels Ltd',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Company TIN (Tax Identification Number)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyTin?: string;

  @ApiPropertyOptional({
    description: 'Company registration number',
    example: 'RW123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyRegistrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Company type',
    enum: ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LIMITED_LIABILITY', 'CORPORATION', 'COOPERATIVE', 'NGO'],
    example: 'LIMITED_LIABILITY',
  })
  @IsOptional()
  @IsEnum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LIMITED_LIABILITY', 'CORPORATION', 'COOPERATIVE', 'NGO'])
  companyType?: string;

  @ApiPropertyOptional({
    description: 'Company ownership type',
    enum: ['PRIVATE_LOCAL', 'PRIVATE_FOREIGN', 'JOINT_VENTURE', 'STATE_OWNED', 'PUBLIC_PRIVATE_PARTNERSHIP', 'OTHER'],
    example: 'PRIVATE_LOCAL',
  })
  @IsOptional()
  @IsEnum(['PRIVATE_LOCAL', 'PRIVATE_FOREIGN', 'JOINT_VENTURE', 'STATE_OWNED', 'PUBLIC_PRIVATE_PARTNERSHIP', 'OTHER'])
  companyOwnershipType?: string;

  @ApiPropertyOptional({
    description: 'Company activity sector',
    example: 'Hospitality and Tourism',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyActivitySector?: string;

  @ApiPropertyOptional({
    description: 'Company website',
    example: 'https://www.abchotels.rw',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyWebsite?: string;

  @ApiPropertyOptional({
    description: 'Number of permanent employees',
    example: 50,
  })
  @IsOptional()
  permanentEmployees?: number;

  @ApiPropertyOptional({
    description: 'Number of part-time employees',
    example: 10,
  })
  @IsOptional()
  partTimeEmployees?: number;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading hotel chain in Rwanda',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  companyDescription?: string;

  // Documents
  @ApiProperty({
    description: 'Array of uploaded documents',
    type: [DocumentUploadDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentUploadDto)
  documents: DocumentUploadDto[];

  // Optional additional application data
  @ApiPropertyOptional({
    description: 'Additional application data (custom fields per association)',
    example: { profession: 'Engineer', yearsExperience: 5 },
  })
  @IsOptional()
  applicationData?: Record<string, any>;
}

/**
 * Response DTO for member registration
 */
export class MemberRegistrationResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Member ID' })
  memberId: string;

  @ApiProperty({ description: 'Member number' })
  memberNumber: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Application ID' })
  applicationId: string;

  @ApiProperty({ description: 'Application number' })
  applicationNumber: string;

  @ApiProperty({ description: 'Application type' })
  applicationType: string;

  @ApiProperty({ description: 'Application status' })
  applicationStatus: string;

  @ApiProperty({ description: 'Company ID (if corporate)' })
  companyId?: string;

  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Message' })
  message: string;
}


