// eslint-disable-next-line max-classes-per-file
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, {
    message: 'Please provide a valid email address',
  })
  @IsNotEmpty({
    message: 'Email is required',
  })
    email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset email sent successfully',
  })
    message: string;

  @ApiProperty({
    description: 'Token expiration time',
    example: '15 minutes',
  })
    expiresIn: string;
}
