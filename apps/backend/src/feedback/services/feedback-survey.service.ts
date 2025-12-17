import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedbackSurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async getFirstByIdOrThrow(surveyId: string) {
    const survey = await this.prisma.feedbackSurvey.findFirst({
      where: {
        id: surveyId,
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }
}
