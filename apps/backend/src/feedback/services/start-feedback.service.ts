import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackSurvey, Receipt } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StartFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(
    userId: string,
    language: string,
    receipt: Receipt,
    survey: FeedbackSurvey,
  ) {
    const questions = await this.prisma.feedbackQuestion.findMany();

    if (!questions || questions.length < 1) {
      throw new NotFoundException('No questions were found');
    }

    const translation = await this.prisma.feedbackQuestionTranslation.findFirst(
      {
        where: {
          language: language,
        },
      },
    );

    if (!translation) {
      throw new NotFoundException(
        `Unable to create question. No translations were found for '${language}'`,
      );
    }

    const questionsBySurvey = await this.prisma.surveyQuestion.count({
      where: {
        surveyId: survey.id,
      },
    });

    return await this.prisma.feedbackResult.create({
      data: {
        userId: userId,
        receiptId: receipt.id,
        totalQuestions: questionsBySurvey,
        currentQuestionId: questions[0].id,
        surveyId: survey.id,
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
}
