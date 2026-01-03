import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  ValidateIf,
  IsPhoneNumber,
  Matches,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export type UserType = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  password: string;
};

export class SignupDto implements UserType {
  @ApiProperty({
    description: 'User full name',
    example: 'Muhire Ighor',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' })
    fullName: string;

  @ApiProperty({
    description: 'User email address (required if phone is not provided)',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o: UserType) => !o.phoneNumber)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email?: string;

  @ApiProperty({
    description: 'User phone number (required if email is not provided)',
    example: '+250788123456',
    required: false,
  })
  @ValidateIf((o: UserType) => !o.email)
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number with country code (e.g., +250788123456)' })
    phoneNumber?: string;

  @ApiProperty({
    description: 'User password - must be at least 8 characters with uppercase, lowercase, number, and special character',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' },
  )
    password: string;
  
    


}
