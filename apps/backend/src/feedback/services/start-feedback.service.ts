import { Injectable } from '@nestjs/common';
import { Receipt } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StartFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(userId: string, receipt: Receipt) {
    const questions = await this.prisma.feedbackQuestion.findMany();

    return await this.prisma.feedbackResult.create({
      data: {
        user_id: userId,
        receipt_id: receipt.id,
        total_questions: questions.length,
        current_question_id: questions[0].id,
      },
      include: {
        current_question: true,
      },
    });
  }
}
