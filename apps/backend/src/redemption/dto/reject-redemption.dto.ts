import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRedemptionDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Invalid PayPal email',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

