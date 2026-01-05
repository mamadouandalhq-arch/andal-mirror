import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FeedbackStatus as PrismaFeedbackStatus,
  PrismaPromise,
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
import {
  AnswerQuestionService,
  StartFeedbackService,
  SurveyQuestionService,
} from './services';
import { FeedbackOptionDto, FeedbackStateResponse } from '@shared/feedback';
import { mapAnswerKeysFromQuestion } from './mappers';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private receiptService: ReceiptService,
    private answerQuestionService: AnswerQuestionService,
    private startFeedbackService: StartFeedbackService,
    private surveyQuestionService: SurveyQuestionService,
  ) {}

  async returnBack(userId: string, dto: ReturnBackDto) {
    const feedback = await this.prisma.feedbackResult.findFirst({
      where: {
        userId,
        status: PrismaFeedbackStatus.inProgress,
      },
      include: {
        currentQuestion: true,
      },
    });

    if (!feedback || !feedback.currentQuestion) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }

    const currentSurveyQuestion = await this.surveyQuestionService.getUnique({
      questionId_surveyId: {
        surveyId: feedback.surveyId,
        questionId: feedback.currentQuestion.id,
      },
    });

    if (currentSurveyQuestion.order === 1) {
      throw new BadRequestException(
        "You can't go back from the first question",
      );
    }

    const previousSurveyQuestion = await this.surveyQuestionService.getUnique({
      surveyId_order: {
        surveyId: feedback.surveyId,
        order: currentSurveyQuestion.order - 1,
      },
    });

    const updatedFeedback = await this.prisma.feedbackResult.update({
      where: { id: feedback.id },
      data: {
        currentQuestionId: previousSurveyQuestion.questionId,
      },
      include: this.getCurrentQuestionIncludeFilter(dto.language),
    });

    return this.convertFeedbackToResponse(updatedFeedback);
  }

  async answerQuestion(
    userId: string,
    { answerKeys, answerText, language }: AnswerQuestionDto,
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
        answerText,
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
      answerText,
    );

    const upsertAnswer = this.answerQuestionService.upsertAnswerIfAnswers(
      validatedFeedback,
      currentQuestion,
      answerKeys,
      answerText,
    );

    // Check if feedback is being completed (last question answered)
    // When feedback is completed, status is set to 'completed' in modifyChangeDataIfLastAnswer
    const isFeedbackCompleted =
      dataToChange.status === PrismaFeedbackStatus.completed;

    const updateFeedback = this.prisma.feedbackResult.update({
      where: {
        id: validatedFeedback.id,
      },
      data: dataToChange,
      include: this.getCurrentQuestionIncludeFilter(language),
    });

    // If feedback is completed, change receipt status from awaitingFeedback to pending
    const updateReceiptStatus = isFeedbackCompleted
      ? this.prisma.receipt.update({
          where: { id: validatedFeedback.receiptId },
          data: { status: ReceiptStatus.pending },
        })
      : null;

    if (upsertAnswer) {
      const operations: PrismaPromise<unknown>[] = [
        updateFeedback,
        upsertAnswer,
      ];
      if (updateReceiptStatus) {
        operations.push(updateReceiptStatus);
      }
      const [updatedFeedback] = await this.prisma.$transaction(operations);

      return await this.convertFeedbackToResponse(
        updatedFeedback as FeedbackResultWithCurrentQuestion,
      );
    }

    if (updateReceiptStatus) {
      const [updatedFeedback] = await this.prisma.$transaction([
        updateFeedback,
        updateReceiptStatus,
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
    const awaitingFeedbackReceipt = await this.receiptService.getFirst({
      userId: userId,
      status: ReceiptStatus.awaitingFeedback,
    });

    if (!awaitingFeedbackReceipt) {
      throw new BadRequestException('No receipt awaiting feedback!');
    }

    const feedback = await this.getUnique({
      userId,
      receiptId: awaitingFeedbackReceipt.id,
      language: dto.language,
    });

    if (feedback) {
      if (feedback.status === PrismaFeedbackStatus.completed) {
        throw new BadRequestException('Feedback already provided!');
      }

      throw new ConflictException('Feedback already in progress.');
    }

    const survey = await this.prisma.feedbackSurvey.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const newFeedback = await this.startFeedbackService.createFeedback(
      userId,
      dto.language,
      awaitingFeedbackReceipt,
    );

    return await this.convertFeedbackToResponse(newFeedback);
  }

  async getState(
    userId: string,
    language: string,
  ): Promise<FeedbackStateResponse> {
    const awaitingFeedbackReceipt = await this.receiptService.getFirst({
      userId: userId,
      status: ReceiptStatus.awaitingFeedback,
    });

    const pendingReceipt = await this.receiptService.getFirst({
      userId: userId,
      status: ReceiptStatus.pending,
    });

    const receipt = pendingReceipt || awaitingFeedbackReceipt;

    if (!receipt) {
      return {
        status: 'unavailable',
        reason: 'noPendingReceipt',
      };
    }

    const feedback = await this.getUnique({
      userId,
      receiptId: receipt.id,
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

      const options = currentQuestion.options.map((option) =>
        FeedbackOptionDto.create({
          key: option.key,
          label: option.translations[0]?.label ?? '',
        }),
      );

      const surveyQuestion = await this.surveyQuestionService.getUnique({
        questionId_surveyId: {
          surveyId: feedback.surveyId,
          questionId: currentQuestion.id,
        },
      });

      response.currentQuestion = {
        id: currentQuestion.id,
        serialNumber: surveyQuestion.order,
        type: currentQuestion.type,
        text: currentQuestion.translations[0].text,
        options,
      };

      if (existingAnswer) {
        if (currentQuestion.type === 'text') {
          response.currentQuestion.currentAnswerText =
            existingAnswer.answerText || '';
        } else {
          response.currentQuestion.currentAnswerKeys =
            existingAnswer.answerKeys.map((key) =>
              mapAnswerKeysFromQuestion(currentQuestion, key),
            );
        }
      }
    }

    return response;
  }
}
