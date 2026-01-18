import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewApplicationDto {
  @ApiProperty({
    description: 'Review action: approve or reject',
    enum: ReviewAction,
    example: ReviewAction.APPROVE,
  })
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @ApiPropertyOptional({
    description: 'Optional notes about the review decision',
    example: 'All documents verified, membership granted',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    description: 'Rejection reason (required if action is REJECT)',
    example: 'Incomplete documentation, please resubmit with proof of address',
  })
  @ValidateIf((o) => o.action === ReviewAction.REJECT)
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

// Keep the old name as alias for backward compatibility
export class ApproveApplicationDto extends ReviewApplicationDto {}


