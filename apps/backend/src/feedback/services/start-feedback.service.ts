import { Injectable, NotFoundException } from '@nestjs/common';
import { Receipt } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StartFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(userId: string, receipt: Receipt) {
    const questions = await this.prisma.feedbackQuestion.findMany();

    if (!questions || questions.length < 1) {
      throw new NotFoundException('No questions were found');
    }

    return await this.prisma.feedbackResult.create({
      data: {
        userId: userId,
        receiptId: receipt.id,
        totalQuestions: questions.length,
        currentQuestionId: questions[0].id,
      },
      include: {
        currentQuestion: true,
      },
    });
  }
}
