import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { ReceiptModule } from '../receipt/receipt.module';
import { AnswerQuestionService, StartFeedbackService } from './services';

@Module({
  imports: [ReceiptModule],
  providers: [FeedbackService, AnswerQuestionService, StartFeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
