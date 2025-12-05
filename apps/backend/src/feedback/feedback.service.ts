import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackStatus, Prisma, Receipt, ReceiptStatus } from '@prisma/client';
import { AnswerQuestionDto, FeedbackStateResponse } from './dto';
import { FeedbackResultWithCurrentQuestion } from './types';
import { ReceiptService } from '../receipt/receipt.service';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
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

    if (!currentFeedback) {
      throw new NotFoundException("You don't provide any feedback right now.");
    }

    const currentQuestion = currentFeedback.current_question;

    if (!currentQuestion) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }

    const { options, type } = currentQuestion;

    if (answers.some((answer) => !options.includes(answer))) {
      throw new BadRequestException('You provided invalid answer option.');
    }

    if (type === 'single' && answers.length !== 1) {
      throw new BadRequestException(
        'Single-choice question must have exactly one answer',
      );
    }

    if (new Set(answers).size !== answers.length) {
      throw new BadRequestException('Duplicate answers are not allowed');
    }

    await this.prisma.feedbackAnswer.create({
      data: {
        feedback_result_id: currentFeedback.id,
        question_id: currentQuestion.id,
        answer: answers,
      },
    });

    // TODO: change approach. It requires to store questions in a some kind of collection.
    const isLastAnswer = currentQuestion.serial_number === 3;

    const dataToChange: Prisma.FeedbackResultUpdateInput = {
      earned_cents: currentFeedback.earned_cents + 100,
    };

    if (!isLastAnswer) {
      const nextQuestion = await this.prisma.feedbackQuestion.findFirst({
        where: {
          serial_number: currentQuestion.serial_number + 1,
        },
      });

      if (!nextQuestion) {
        throw new NotFoundException('Could not find next question');
      }

      dataToChange.current_question = {
        connect: {
          id: nextQuestion.id,
        },
      };
    }

    if (isLastAnswer) {
      dataToChange.status = FeedbackStatus.completed;
      dataToChange.completed_at = new Date();
      dataToChange.current_question = { disconnect: true };
    }

    dataToChange.answered_questions = currentFeedback.answered_questions + 1;

    const newFeedback = await this.prisma.feedbackResult.update({
      where: {
        id: currentFeedback.id,
      },
      data: dataToChange,
      include: {
        current_question: true,
      },
    });

    return this.convertFeedbackToResponse(newFeedback);
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

    const newFeedback = await this.createFeedback(userId, pendingReceipt);

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
