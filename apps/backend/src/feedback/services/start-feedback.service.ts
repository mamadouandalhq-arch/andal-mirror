import { Injectable, NotFoundException } from '@nestjs/common';
import { Receipt } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StartFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(userId: string, language: string, receipt: Receipt) {
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

    return await this.prisma.feedbackResult.create({
      data: {
        userId: userId,
        receiptId: receipt.id,
        totalQuestions: questions.length,
        currentQuestionId: questions[0].id,
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
