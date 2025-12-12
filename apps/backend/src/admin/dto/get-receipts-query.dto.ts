import { IsEnum, IsOptional } from 'class-validator';
import { FeedbackStatus, ReceiptStatus } from '@prisma/client';

export class GetReceiptsQueryDto {
  @IsOptional()
  @IsEnum(FeedbackStatus)
  feedbackStatus?: FeedbackStatus;

  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;
}
