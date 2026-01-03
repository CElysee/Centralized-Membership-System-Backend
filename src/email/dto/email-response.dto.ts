import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class EmailResponseDto {
  @ApiProperty({
    description: 'Indicates whether the email was sent successfully',
    example: true,
  })
    success: boolean;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Email sent successfully',
  })
    message: string;

  @ApiPropertyOptional({
    description: 'Unique message ID from the email service (only present on success)',
    example: '<1234567890.123456.789012@tembera.com>',
  })
    messageId?: string;

  @ApiPropertyOptional({
    description: 'Error details (only present on failure)',
    example: 'SMTP connection failed',
  })
    error?: string;

  @ApiPropertyOptional({
    description: 'ISO timestamp when the email was sent',
    example: '2025-11-11T15:30:00.000Z',
  })
    timestamp?: string;
}
