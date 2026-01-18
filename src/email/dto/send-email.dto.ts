import {
  IsEmail, IsString, IsBoolean, IsOptional, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class SendEmailDto {
  @ApiProperty({
    description: 'Sender email address',
    example: 'support@tembera.com',
    format: 'email',
  })
  @IsEmail()
    from: string;

  @ApiProperty({
    description: 'Array of recipient email addresses',
    example: ['user@example.com', 'admin@example.com'],
    type: [String],
    format: 'email',
  })
  @IsArray()
  @IsEmail({}, {
    each: true,
  })
    to: string[];

  @ApiProperty({
    description: 'Display name for the sender',
    example: 'Tembera Support Team',
  })
  @IsString()
    fromName: string;

  @ApiProperty({
    description: 'Array of display names for recipients (must match order of "to" array)',
    example: ['John Doe', 'Jane Smith'],
    type: [String],
  })
  @IsArray()
  @IsString({
    each: true,
  })
    toNames: string[];

  @ApiProperty({
    description: 'Email subject line',
    example: 'Welcome to Tembera - Your Account is Ready!',
  })
  @IsString()
    subject: string;

  @ApiProperty({
    description: 'HTML content of the email',
    example: '<h1>Welcome!</h1><p>Thank you for joining Tembera. Your account is now active.</p>',
  })
  @IsString()
    htmlContent: string;

  @ApiPropertyOptional({
    description: 'Plain text version of the email content (fallback for non-HTML clients)',
    example: 'Welcome! Thank you for joining Tembera. Your account is now active.',
  })
  @IsOptional()
  @IsString()
    textContent?: string;

  @ApiPropertyOptional({
    description: 'Whether recipients can reply to this email',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
    isReplyable?: boolean = true;

  @ApiPropertyOptional({
    description: 'Custom reply-to email address (only used if isReplyable is true)',
    example: '63inc@gmail.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
    replyTo?: string;

  @ApiPropertyOptional({
    description: 'Display name for the reply-to address',
    example: 'Tembera No-Reply',
  })
  @IsOptional()
  @IsString()
    replyToName?: string;
}
