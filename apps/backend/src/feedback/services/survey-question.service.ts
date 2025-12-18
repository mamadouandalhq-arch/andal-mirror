import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SurveyQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnique(
    where: Prisma.SurveyQuestionWhereUniqueInput,
    select?: Prisma.SurveyQuestionSelect,
  ) {
    const surveyQuestion = await this.prisma.surveyQuestion.findUnique({
      where,
      select,
    });

    if (!surveyQuestion) {
      throw new NotFoundException('Survey question not found');
    }

    return surveyQuestion;
  }
}
