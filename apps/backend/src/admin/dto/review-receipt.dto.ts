import { ReceiptStatus } from '@prisma/client';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

const ReviewReceiptStatuses = [
  ReceiptStatus.approved,
  ReceiptStatus.rejected,
] as const;

export class ReviewReceiptDto {
  @IsNotEmpty()
  @IsString()
  receiptId: string;

  @IsIn(ReviewReceiptStatuses)
  status: Exclude<ReceiptStatus, 'pending'>;
}
