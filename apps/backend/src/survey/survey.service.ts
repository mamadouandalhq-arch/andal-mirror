import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { feedbackQuestionWithRelationsIncludeConst } from '../question/consts';
import { CreateActiveSurveyDto } from './dto';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async createActiveSurvey(dto: CreateActiveSurveyDto) {
    const { name, questionIds } = dto;

    const questions = await this.prisma.feedbackQuestion.findMany({
      where: {
        id: { in: questionIds },
        isArchived: false,
      },
      select: { id: true },
    });

    if (questions.length !== questionIds.length) {
      throw new NotFoundException(
        'One or more questions do not exist or are archived',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.feedbackSurvey.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      const survey = await tx.feedbackSurvey.create({
        data: {
          name,
          isActive: true,
        },
      });

      await tx.surveyQuestion.createMany({
        data: questionIds.map((questionId, index) => ({
          surveyId: survey.id,
          questionId,
          order: index + 1,
        })),
      });

      return this.getActiveSurveyOrThrow();
    });
  }

  async getActiveSurveyOrThrow() {
    const survey = await this.prisma.feedbackSurvey.findFirst({
      where: {
        isActive: true,
      },
      include: this.getActiveSurveyWithQuestionsInclude(),
    });

    if (!survey) {
      throw new NotFoundException('Active survey not found');
    }

    return {
      id: survey.id,
      name: survey.name,
      isActive: survey.isActive,
      questions: survey.surveyQuestions.map((sq) => sq.question),
    };
  }

  private getActiveSurveyWithQuestionsInclude() {
    return {
      surveyQuestions: {
        orderBy: { order: 'asc' as const },
        include: {
          question: {
            include: feedbackQuestionWithRelationsIncludeConst,
          },
        },
      },
    };
  }
}
