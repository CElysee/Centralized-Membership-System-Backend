import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API response wrapper DTO
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Success',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: T;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2026-01-12T10:30:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Correlation ID for request tracing',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  correlationId?: string;
}

/**
 * Paginated response wrapper DTO
 */
export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Error response DTO
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message(s)',
    example: 'Validation failed',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'BadRequestException',
  })
  error: string;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2026-01-12T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/auth/login',
  })
  path: string;

  @ApiPropertyOptional({
    description: 'Correlation ID for request tracing',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  correlationId?: string;
}


