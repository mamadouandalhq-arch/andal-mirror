import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FeedbackStatus as PrismaFeedbackStatus,
  ReceiptStatus,
} from '@prisma/client';
import {
  AnswerQuestionDto,
  GetUniqueFeedbackDto,
  StartFeedbackDto,
} from './dto';
import { FeedbackResultWithCurrentQuestion } from './types';
import { ReceiptService } from '../receipt/receipt.service';
import { AnswerQuestionService, StartFeedbackService } from './services';
import { FeedbackStateResponse } from '@shared/feedback';

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
    { answers, language }: AnswerQuestionDto,
  ): Promise<FeedbackStateResponse> {
    const currentFeedback = await this.prisma.feedbackResult.findFirst({
      where: {
        userId: userId,
        status: PrismaFeedbackStatus.inProgress,
      },
      include: this.getCurrentQuestionIncludeFilter(language),
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
      answers,
    );

    const createAnswer = this.prisma.feedbackAnswer.create({
      data: {
        feedbackResultId: validatedFeedback.id,
        questionId: currentQuestion.id,
        answer: answers,
      },
    });

    const updateFeedback = this.prisma.feedbackResult.update({
      where: {
        id: validatedFeedback.id,
      },
      data: dataToChange,
      include: this.getCurrentQuestionIncludeFilter(language),
    });

    const [, updatedFeedback] = await this.prisma.$transaction([
      createAnswer,
      updateFeedback,
    ]);

    return this.convertFeedbackToResponse(updatedFeedback);
  }

  async startFeedback(
    userId: string,
    dto: StartFeedbackDto,
  ): Promise<FeedbackStateResponse> {
    const pendingReceipt = await this.receiptService.getFirst({
      userId: userId,
      status: ReceiptStatus.pending,
    });

    if (!pendingReceipt) {
      throw new BadRequestException('No pending receipt!');
    }

    const feedback = await this.getUnique({
      userId,
      receiptId: pendingReceipt.id,
      language: dto.language,
    });

    if (feedback) {
      if (feedback.status === PrismaFeedbackStatus.completed) {
        throw new BadRequestException('Feedback already provided!');
      }

      throw new ConflictException('Feedback already in progress.');
    }

    const newFeedback = await this.startFeedbackService.createFeedback(
      userId,
      dto.language,
      pendingReceipt,
    );

    return this.convertFeedbackToResponse(newFeedback);
  }

  async getState(
    userId: string,
    language: string,
  ): Promise<FeedbackStateResponse> {
    const pendingReceipt = await this.receiptService.getFirst({
      userId: userId,
      status: ReceiptStatus.pending,
    });

    if (!pendingReceipt) {
      return {
        status: 'unavailable',
        reason: 'noPendingReceipt',
      };
    }

    const feedback = await this.getUnique({
      userId,
      receiptId: pendingReceipt.id,
      language,
    });

    if (!feedback) {
      return { status: 'notStarted' };
    }

    if (feedback.status === PrismaFeedbackStatus.completed) {
      return this.convertFeedbackToResponse(feedback);
    }

    return this.convertFeedbackToResponse(feedback);
  }

  private async getUnique(dto: GetUniqueFeedbackDto) {
    return await this.prisma.feedbackResult.findUnique({
      where: {
        userId_receiptId: {
          userId: dto.userId,
          receiptId: dto.receiptId,
        },
      },
      include: this.getCurrentQuestionIncludeFilter(dto.language),
    });
  }

  private getCurrentQuestionIncludeFilter(language: string) {
    return {
      currentQuestion: {
        include: {
          translations: {
            where: { lang: language },
            take: 1,
          },
        },
      },
    };
  }

  private convertFeedbackToResponse(
    feedback: FeedbackResultWithCurrentQuestion,
  ): FeedbackStateResponse {
    const response: FeedbackStateResponse = {
      status: feedback.status,
      totalQuestions: feedback.totalQuestions,
      pointsValue: feedback.pointsValue,
      answeredQuestions: feedback.answeredQuestions,
    };

    if (feedback.status !== PrismaFeedbackStatus.completed) {
      const currentQuestion = feedback.currentQuestion;

      if (!currentQuestion || currentQuestion.translations.length < 1) {
        throw new NotFoundException('Invalid current question or translation');
      }

      response.currentQuestion = {
        id: currentQuestion.id,
        serialNumber: currentQuestion.serialNumber,
        type: currentQuestion.type,
        text: currentQuestion.translations[0].text,
        options: currentQuestion.translations[0].options,
      };
    }

    return response;
  }
}
