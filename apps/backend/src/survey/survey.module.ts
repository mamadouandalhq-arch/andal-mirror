import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { AdminSurveyController } from './admin-survey.controller';

@Module({
  controllers: [AdminSurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
