import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  Length,
  ValidateIf,
} from 'class-validator';

/**
 * DTO for OTP verification request
 * Supports both registration OTP and 2FA login OTP verification
 */
export class VerifyOtpDto {
  @ApiProperty({
    description: 'Session ID for 2FA login verification (required for 2FA, not for registration)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'Email address (required if phone and sessionId not provided)',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNumber && !o.sessionId)
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number (required if email and sessionId not provided)',
    example: '+250788123456',
    required: false,
  })
  @ValidateIf((o) => !o.email && !o.sessionId)
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  otpCode: string;
}

/**
 * DTO for resending OTP
 */
export class ResendOtpDto {
  @ApiProperty({
    description: 'Email address (required if phone not provided)',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number (required if email not provided)',
    example: '+250788123456',
    required: false,
  })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber()
  phoneNumber?: string;
}

/**
 * Response DTO for OTP verification
 */
export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'Verification success' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'User ID' })
  id?: string;

  @ApiProperty({ description: 'User full name' })
  fullName?: string;

  @ApiProperty({ description: 'User email' })
  email?: string;

  @ApiProperty({ description: 'User phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Access token (if verification successful)' })
  accessToken?: string;

  @ApiProperty({ description: 'Refresh token (if verification successful)' })
  refreshToken?: string;
}

/**
 * Response DTO for resend OTP
 */
export class ResendOtpResponseDto {
  @ApiProperty({ description: 'Resend success' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Expiry time in minutes' })
  expiresIn: number;
}


