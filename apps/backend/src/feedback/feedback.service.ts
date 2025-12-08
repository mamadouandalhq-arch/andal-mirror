import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackStatus, ReceiptStatus } from '@prisma/client';
import { AnswerQuestionDto, FeedbackStateResponse } from './dto';
import { FeedbackResultWithCurrentQuestion } from './types';
import { ReceiptService } from '../receipt/receipt.service';
import { AnswerQuestionService, StartFeedbackService } from './services';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
    private answerQuestionService: AnswerQuestionService,
    private startFeedbackService: StartFeedbackService,
  ) {}

  async answerQuestion(
    userId: string,
    { answers }: AnswerQuestionDto,
  ): Promise<FeedbackStateResponse> {
    const currentFeedback = await this.prisma.feedbackResult.findFirst({
      where: {
        user_id: userId,
        status: FeedbackStatus.in_progress,
      },
      include: { current_question: true },
    });

    const { feedback: validatedFeedback, currentQuestion } =
      this.answerQuestionService.validateAnswerOrThrow(
        currentFeedback,
        answers,
      );

    await this.answerQuestionService.getAnswerAndThrowIfAnswered(
      validatedFeedback,
      currentQuestion,
    );

    const dataToChange = await this.answerQuestionService.getAnswerDataToChange(
      validatedFeedback,
      currentQuestion,
    );

    const createAnswer = this.prisma.feedbackAnswer.create({
      data: {
        feedback_result_id: validatedFeedback.id,
        question_id: currentQuestion.id,
        answer: answers,
      },
    });

    const updateFeedback = this.prisma.feedbackResult.update({
      where: {
        id: validatedFeedback.id,
      },
      data: dataToChange,
      include: {
        current_question: true,
      },
    });

    const [, updatedFeedback] = await this.prisma.$transaction([
      createAnswer,
      updateFeedback,
    ]);

    return this.convertFeedbackToResponse(updatedFeedback);
  }

  async startFeedback(userId: string): Promise<FeedbackStateResponse> {
    const pendingReceipt = await this.receiptService.getFirst({
      user_id: userId,
      status: ReceiptStatus.pending,
    });

    if (!pendingReceipt) {
      throw new BadRequestException('No pending receipt!');
    }

    const feedback = await this.prisma.feedbackResult.findUnique({
      where: {
        user_id_receipt_id: {
          user_id: userId,
          receipt_id: pendingReceipt.id,
        },
      },
    });

    if (feedback) {
      if (feedback.status === FeedbackStatus.completed) {
        throw new BadRequestException('Feedback already provided!');
      }

      throw new ConflictException('Feedback already in progress.');
    }

    const newFeedback = await this.startFeedbackService.createFeedback(
      userId,
      pendingReceipt,
    );

    return this.convertFeedbackToResponse(newFeedback);
  }

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

    if (!feedback) {
      return { status: 'not_started' };
    }

    if (feedback.status === FeedbackStatus.completed) {
      return this.convertFeedbackToResponse(feedback);
    }

    return this.convertFeedbackToResponse(feedback);
  }

  private convertFeedbackToResponse(
    feedback: FeedbackResultWithCurrentQuestion,
  ): FeedbackStateResponse {
    const response: FeedbackStateResponse = {
      status: feedback.status,
      totalQuestions: feedback.total_questions,
      earnedCents: feedback.earned_cents,
      answered_questions: feedback.answered_questions,
    };

    if (feedback.status !== FeedbackStatus.completed) {
      response.current_question = feedback.current_question!;
    }

    return response;
  }
}
