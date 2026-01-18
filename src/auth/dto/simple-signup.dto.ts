import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { UserType } from './signup.dto';

/**
 * DTO for simple user signup with default USER role
 */
export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'Email address (either email or phoneNumber must be provided)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  @ValidateIf((record:UserType)=>!record.phoneNumber)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number (either email or phoneNumber must be provided)',
    example: '+250788123456',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  @ValidateIf((record:UserType)=>!record.email)
  phoneNumber?: string;

  @ApiProperty({
    description: 'Password',
    minLength: 8,
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

