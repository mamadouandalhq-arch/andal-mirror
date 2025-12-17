import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { ReceiptModule } from '../receipt/receipt.module';
import {
  AnswerQuestionService,
  FeedbackSurveyService,
  StartFeedbackService,
  SurveyQuestionService,
} from './services';

@Module({
  imports: [ReceiptModule],
  providers: [
    FeedbackService,
    AnswerQuestionService,
    StartFeedbackService,
    SurveyQuestionService,
    FeedbackSurveyService,
  ],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
