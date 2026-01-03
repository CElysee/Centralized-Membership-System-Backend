import {
  IsString, IsEmail, MinLength, ValidateIf, IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class LoginDto {
  @ApiProperty({
    description: 'User email address (required if phone is not provided)',
    example: 'devighor@site.com',
    required: false,
  })
  @ValidateIf((o) => !o.phoneNuber)
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone number (required if email is not provided)',
    example: '+250798486619',
    required: false,
  })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
