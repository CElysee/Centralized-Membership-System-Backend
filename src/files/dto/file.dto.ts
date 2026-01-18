import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

/**
 * Response DTO for file information
 */
export class FileInfoDto {
  @ApiProperty({ description: 'File ID' })
  id: string;

  @ApiProperty({ description: 'Stored file name' })
  fileName: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'File extension' })
  extension: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'File category' })
  category: string;

  @ApiProperty({ description: 'File status' })
  status: string;

  @ApiPropertyOptional({ description: 'File checksum' })
  checksum?: string;

  @ApiProperty({ description: 'Upload date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}

/**
 * DTO for getting multiple files by IDs
 */
export class GetFilesByIdsDto {
  @ApiProperty({
    description: 'Array of file IDs',
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}

/**
 * Response for multiple files info
 */
export class MultipleFilesInfoDto {
  @ApiProperty({ description: 'Array of file information', type: [FileInfoDto] })
  files: FileInfoDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;
}
