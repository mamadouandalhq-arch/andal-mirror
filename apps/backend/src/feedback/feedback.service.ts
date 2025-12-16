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
  ReturnBackDto,
  StartFeedbackDto,
} from './dto';
import { FeedbackResultWithCurrentQuestion } from './types';
import { ReceiptService } from '../receipt/receipt.service';
import { AnswerQuestionService, StartFeedbackService } from './services';
import { FeedbackOptionDto, FeedbackStateResponse } from '@shared/feedback';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
    private answerQuestionService: AnswerQuestionService,
    private startFeedbackService: StartFeedbackService,
  ) {}

  async returnBack(userId: string, dto: ReturnBackDto) {
    const currentFeedback = await this.prisma.feedbackResult.findFirst({
      where: {
        userId: userId,
        status: PrismaFeedbackStatus.inProgress,
      },
      include: this.getCurrentQuestionIncludeFilter(dto.language),
    });

    if (!currentFeedback || !currentFeedback.currentQuestion) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }

    if (currentFeedback.currentQuestion.serialNumber === 1) {
      throw new BadRequestException(
        `You can't go back from the first question`,
      );
    }

    const previousQuestion = await this.prisma.feedbackQuestion.findUnique({
      where: {
        serialNumber: currentFeedback.currentQuestion.serialNumber - 1,
      },
    });

    if (!previousQuestion) {
      throw new NotFoundException('Previous question does not exist');
    }

    const updatedFeedback = await this.prisma.feedbackResult.update({
      where: {
        id: currentFeedback.id,
      },
      data: {
        currentQuestionId: previousQuestion.id,
      },
      include: this.getCurrentQuestionIncludeFilter(dto.language),
    });

    return await this.convertFeedbackToResponse(updatedFeedback);
  }

  async answerQuestion(
    userId: string,
    { answerKeys, language }: AnswerQuestionDto,
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
        answerKeys,
      );

    const existingAnswer = await this.prisma.feedbackAnswer.findUnique({
      where: {
        feedbackResultId_questionId: {
          feedbackResultId: validatedFeedback.id,
          questionId: currentQuestion.id,
        },
      },
    });

    const dataToChange = await this.answerQuestionService.getAnswerDataToChange(
      validatedFeedback,
      currentQuestion,
      existingAnswer,
      answerKeys,
    );

    const upsertAnswer = this.answerQuestionService.upsertAnswerIfAnswers(
      validatedFeedback,
      currentQuestion,
      answerKeys,
    );

    const updateFeedback = this.prisma.feedbackResult.update({
      where: {
        id: validatedFeedback.id,
      },
      data: dataToChange,
      include: this.getCurrentQuestionIncludeFilter(language),
    });

    if (upsertAnswer) {
      const [updatedFeedback] = await this.prisma.$transaction([
        updateFeedback,
        upsertAnswer,
      ]);

      return await this.convertFeedbackToResponse(updatedFeedback);
    }

    const updatedFeedback = await updateFeedback;

    return await this.convertFeedbackToResponse(updatedFeedback);
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

    return await this.convertFeedbackToResponse(newFeedback);
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
      return await this.convertFeedbackToResponse(feedback);
    }

    return await this.convertFeedbackToResponse(feedback);
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
    };
  }

  private async convertFeedbackToResponse(
    feedback: FeedbackResultWithCurrentQuestion,
  ): Promise<FeedbackStateResponse> {
    console.log({ feedback: JSON.stringify(feedback, null, 2) });
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

      const existingAnswer = await this.prisma.feedbackAnswer.findUnique({
        where: {
          feedbackResultId_questionId: {
            feedbackResultId: feedback.id,
            questionId: currentQuestion.id,
          },
        },
      });

      const options = currentQuestion.options.map((option) => {
        const data = {
          key: option.key,
          label: option.translations[0].label,
        };
        return FeedbackOptionDto.create(data);
      });

      response.currentQuestion = {
        id: currentQuestion.id,
        serialNumber: currentQuestion.serialNumber,
        type: currentQuestion.type,
        text: currentQuestion.translations[0].text,
        options: options,
      };

      if (existingAnswer) {
        // get from db, from another table
        // each answer key map an answer from the db, then create an array of answers from db and write this array to the resulting currentQuestion.currentAnswer
        response.currentQuestion.currentAnswer = ['1'];
      }
    }

    return response;
  }
}
