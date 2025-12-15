import { ReceiptStatus } from '@prisma/client';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const ReviewReceiptStatuses = [
  ReceiptStatus.approved,
  ReceiptStatus.rejected,
] as const;

export class ReviewReceiptDto {
  @ApiProperty({
    description: 'Receipt id',
    example: '8b3c1d2e-7f9a-4c2a-9c3d-123456789abc',
  })
  @IsNotEmpty()
  @IsString()
  receiptId: string;

  @ApiProperty({
    description:
      'Receipt status. Can only accept two values: approved, rejected',
    example: 'approved',
  })
  @IsIn(ReviewReceiptStatuses)
  status: Exclude<ReceiptStatus, 'pending'>;
}
