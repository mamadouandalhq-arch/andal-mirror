import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackStatus, Receipt, ReceiptStatus } from '@prisma/client';
import { FeedbackStateResponse } from './dto';
import { FeedbackResultWithCurrentQuestion } from './types';
import { ReceiptService } from '../receipt/receipt.service';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
  ) {}

  async getState(userId: string): Promise<FeedbackStateResponse> {
    const pendingReceipt = await this.receiptService.getFirst({
      user_id: userId,
      status: ReceiptStatus.pending,
    });

    if (!pendingReceipt) {
      return {
        status: 'unavailable',
        reason: 'no_pending_receipt',
      };
    }

    const feedback = await this.prisma.feedbackResult.findUnique({
      where: {
        user_id_receipt_id: {
          user_id: userId,
          receipt_id: pendingReceipt.id,
        },
      },
      include: {
        current_question: true,
      },
    });

    if (feedback && feedback.status === FeedbackStatus.completed) {
      return {
        status: 'unavailable',
        reason: 'feedback_provided',
      };
    }

    if (!feedback) {
      const newFeedback = await this.createFeedback(userId, pendingReceipt);

      return this.convertFeedbackToResponse(newFeedback);
    }

    return this.convertFeedbackToResponse(feedback);
  }

  private async createFeedback(userId: string, receipt: Receipt) {
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

  private convertFeedbackToResponse(
    feedback: FeedbackResultWithCurrentQuestion,
  ): FeedbackStateResponse {
    return {
      status: feedback.status,
      totalQuestions: feedback.total_questions,
      current_question: feedback.current_question!,
      earnedCents: feedback.earned_cents,
    };
  }
}
