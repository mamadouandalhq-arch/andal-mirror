import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../common';
import { UserRole } from '@prisma/client';
import { CreateActiveSurveyDto } from './dto';
import { CreateActiveSurveyDocs, GetActiveSurveyDocs } from './swagger';

@Roles(UserRole.admin)
@UseGuards(JwtGuard, RolesGuard)
@Controller('admin')
export class AdminSurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @GetActiveSurveyDocs()
  @Get('active-survey')
  getActiveSurvey() {
    return this.surveyService.getActiveSurveyOrThrow();
  }

  @CreateActiveSurveyDocs()
  @Post('active-survey')
  createActiveSurvey(@Body() dto: CreateActiveSurveyDto) {
    return this.surveyService.createActiveSurvey(dto);
  }
}
