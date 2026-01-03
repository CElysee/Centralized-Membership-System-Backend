// eslint-disable-next-line max-classes-per-file
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123def456ghi789',
  })
  @IsString({
    message: 'Reset token must be a string',
  })
  @IsNotEmpty({
    message: 'Reset token is required',
  })
    token: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString({
    message: 'Password must be a string',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
    newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewSecurePass123!',
  })
  @IsString({
    message: 'Confirm password must be a string',
  })
  @IsNotEmpty({
    message: 'Confirm password is required',
  })
    confirmPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully',
  })
    message: string;
}
