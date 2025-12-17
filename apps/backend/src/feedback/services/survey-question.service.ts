import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetUniqueSurveyQuestionDto } from '../dto';

@Injectable()
export class SurveyQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnique(dto: GetUniqueSurveyQuestionDto) {
    const surveyQuestion = await this.prisma.surveyQuestion.findUnique({
      where: {
        questionId_surveyId: dto,
      },
    });

    if (!surveyQuestion) {
      throw new NotFoundException('Survey question not found');
    }

    return surveyQuestion;
  }
}
