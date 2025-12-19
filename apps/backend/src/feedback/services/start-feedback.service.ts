import { Injectable, NotFoundException } from '@nestjs/common';
import { Receipt } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SurveyQuestionService } from './survey-question.service';

@Injectable()
export class StartFeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveyQuestionService: SurveyQuestionService,
  ) {}

  async createFeedback(userId: string, language: string, receipt: Receipt) {
    const surveyWithQuestions =
      await this.getActiveSurveyWithQuestionsOrThrow(language);

    const questions = surveyWithQuestions.surveyQuestions;

    if (!questions || questions.length < 1) {
      throw new NotFoundException('No questions were found');
    }

    const questionsBySurvey = await this.prisma.surveyQuestion.count({
      where: {
        surveyId: surveyWithQuestions.id,
      },
    });

    const firstSurveyQuestion = await this.surveyQuestionService.getUnique(
      {
        surveyId_order: {
          surveyId: surveyWithQuestions.id,
          order: 1,
        },
      },
      {
        questionId: true,
      },
    );

    return await this.prisma.feedbackResult.create({
      data: {
        userId: userId,
        receiptId: receipt.id,
        totalQuestions: questionsBySurvey,
        currentQuestionId: firstSurveyQuestion.questionId,
        surveyId: surveyWithQuestions.id,
        pointsValue: surveyWithQuestions.startPoints,
      },
      include: {
        currentQuestion: {
          include: {
            translations: {
              where: { language: language },
              take: 1,
            },
            options: {
              include: {
                translations: {
                  where: { language: language },
                },
              },
            },
          },
        },
      },
    });
  }

  private async getActiveSurveyWithQuestionsOrThrow(language: string) {
    const survey = await this.prisma.feedbackSurvey.findFirst({
      where: { isActive: true },
      include: this.getActiveSurveyInclude(language),
    });

    if (!survey) {
      throw new NotFoundException('No active survey found');
    }

    return survey;
  }

  private getActiveSurveyInclude(language: string) {
    return {
      surveyQuestions: {
        orderBy: { order: 'asc' as const },
        include: {
          question: {
            include: {
              translations: { where: { language } },
              options: {
                orderBy: { order: 'asc' as const },
                include: {
                  translations: { where: { language } },
                },
              },
            },
          },
        },
      },
    };
  }
}
