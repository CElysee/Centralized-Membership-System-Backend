import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for verifying email with token
 */
export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token sent to user email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * Response DTO for email verification
 */
export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Email that was verified',
    example: 'user@example.com',
  })
  email: string;
}

/**
 * DTO for resending verification email
 */
export class ResendVerificationEmailDto {
  @ApiProperty({
    description: 'Email address to send verification to',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

/**
 * Response DTO for resending verification email
 */
export class ResendVerificationEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Verification email sent successfully',
  })
  message: string;
}



