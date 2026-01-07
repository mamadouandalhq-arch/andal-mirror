import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackResultWithCurrentQuestion } from '../types';
import {
  FeedbackAnswer,
  FeedbackQuestion,
  FeedbackStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SurveyQuestionService } from './survey-question.service';

@Injectable()
export class AnswerQuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveyQuestionService: SurveyQuestionService,
  ) {}

  upsertAnswerIfAnswers(
    feedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
    answerKeys?: string[],
    answerText?: string,
  ) {
    // Handle text-type questions
    if (currentQuestion.type === 'text') {
      // For text questions, we save answer even if it's empty string
      // (user explicitly answered, even if with empty text)
      if (answerText === undefined) {
        return;
      }

      return this.prisma.feedbackAnswer.upsert({
        where: {
          feedbackResultId_questionId: {
            feedbackResultId: feedback.id,
            questionId: currentQuestion.id,
          },
        },
        update: {
          answerText: answerText || null,
          answerKeys: [], // empty array for text questions
        },
        create: {
          feedbackResultId: feedback.id,
          questionId: currentQuestion.id,
          answerText: answerText || null,
          answerKeys: [], // empty array for text questions
        },
      });
    }

    // Handle single/multiple-type questions
    if (!answerKeys) return;

    return this.prisma.feedbackAnswer.upsert({
      where: {
        feedbackResultId_questionId: {
          feedbackResultId: feedback.id,
          questionId: currentQuestion.id,
        },
      },
      update: {
        answerKeys,
        answerText: null, // clear answerText for non-text questions
      },
      create: {
        feedbackResultId: feedback.id,
        questionId: currentQuestion.id,
        answerKeys,
        answerText: null,
      },
    });
  }

  async getAnswerDataToChange(
    validatedFeedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
    existingAnswer: FeedbackAnswer | null,
    answers?: string[],
    answerText?: string,
  ) {
    const currentSurveyQuestion = await this.surveyQuestionService.getUnique({
      questionId_surveyId: {
        surveyId: validatedFeedback.surveyId,
        questionId: currentQuestion.id,
      },
    });

    const nextSurveyQuestion = await this.prisma.surveyQuestion.findUnique({
      where: {
        surveyId_order: {
          surveyId: validatedFeedback.surveyId,
          order: currentSurveyQuestion.order + 1,
        },
      },
      select: { questionId: true },
    });

    const isLastAnswer = !nextSurveyQuestion;

    const survey = await this.prisma.feedbackSurvey.findUnique({
      where: { id: validatedFeedback.surveyId },
      select: { pointsPerAnswer: true },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    // Check if we have an answer (either answerKeys for single/multiple or answerText for text)
    // For text questions, empty string should not count as an answer (no points awarded)
    const hasAnswer =
      (answers && answers.length > 0) ||
      (answerText !== undefined && answerText.trim().length > 0);

    const dataToChange: Prisma.FeedbackResultUpdateInput = {
      pointsValue:
        hasAnswer && !existingAnswer
          ? validatedFeedback.pointsValue + survey.pointsPerAnswer
          : undefined,
    };

    if (!isLastAnswer) {
      dataToChange.currentQuestion = {
        connect: { id: nextSurveyQuestion.questionId },
      };
    } else {
      this.modifyChangeDataIfLastAnswer(dataToChange);
    }

    if (hasAnswer && !existingAnswer) {
      dataToChange.answeredQuestions = validatedFeedback.answeredQuestions + 1;
    }

    return dataToChange;
  }

  modifyChangeDataIfLastAnswer(dataToChange: Prisma.FeedbackResultUpdateInput) {
    dataToChange.status = FeedbackStatus.completed;
    dataToChange.completedAt = new Date();
    dataToChange.currentQuestion = { disconnect: true };
  }

  validateAnswerOrThrow(
    feedback: FeedbackResultWithCurrentQuestion | null,
    answerKeys?: string[],
    answerText?: string,
  ) {
    if (!feedback || !feedback.currentQuestion) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }

    const currentQuestion = feedback.currentQuestion;

    const translation = currentQuestion.translations[0];
    if (!translation) {
      throw new NotFoundException(
        'Unable to answer question. No translation was found for selected language.',
      );
    }

    // Handle text-type questions
    if (currentQuestion.type === 'text') {
      if (answerKeys && answerKeys.length > 0) {
        throw new BadRequestException(
          'Text questions should not have answerKeys',
        );
      }
      // answerText is optional - can be empty string or undefined
      return { feedback, currentQuestion };
    }

    // Handle single/multiple-type questions
    const optionKeys = currentQuestion.options.map((o) => o.key);

    if (answerText) {
      throw new BadRequestException(
        'Single/multiple questions should not have answerText',
      );
    }

    if (!answerKeys) return { feedback, currentQuestion };

    if (answerKeys.some((k) => !optionKeys.includes(k))) {
      throw new BadRequestException('You provided invalid answer option key.');
    }

    if (currentQuestion.type === 'single' && answerKeys.length !== 1) {
      throw new BadRequestException(
        'Single-choice question must have exactly one answer',
      );
    }

    if (new Set(answerKeys).size !== answerKeys.length) {
      throw new BadRequestException('Duplicate answers are not allowed');
    }

    return { feedback, currentQuestion };
  }
}
