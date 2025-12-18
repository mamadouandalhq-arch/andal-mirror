import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { AdminQuestionController } from './admin-question.controller';

@Module({
  providers: [QuestionService],
  controllers: [AdminQuestionController],
})
export class QuestionModule {}
