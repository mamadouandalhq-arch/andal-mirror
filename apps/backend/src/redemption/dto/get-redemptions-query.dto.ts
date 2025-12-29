import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RedemptionStatus } from '@prisma/client';

const RedemptionStatuses = [
  RedemptionStatus.pending,
  RedemptionStatus.approved,
  RedemptionStatus.completed,
  RedemptionStatus.rejected,
] as const;

export class GetRedemptionsQueryDto {
  @ApiProperty({
    description: 'Filter by redemption status',
    enum: RedemptionStatuses,
    required: false,
  })
  @IsOptional()
  @IsIn(RedemptionStatuses)
  status?: RedemptionStatus;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
