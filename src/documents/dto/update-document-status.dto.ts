import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentStatus } from 'src/database/models/document.model';

export class UpdateDocumentStatusDto {
  @ApiProperty({
    description: 'Document status',
    enum: DocumentStatus,
    example: DocumentStatus.VERIFIED,
  })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Rejection reason (required if status is REJECTED)',
    example: 'Document is unclear, please upload a better quality image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}


