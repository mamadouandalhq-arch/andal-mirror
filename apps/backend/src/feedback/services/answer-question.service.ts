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

@Injectable()
export class AnswerQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  upsertAnswerIfAnswers(
    feedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
    answers?: string[],
  ) {
    if (!answers) {
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
        answer: answers,
      },
      create: {
        feedbackResultId: feedback.id,
        questionId: currentQuestion.id,
        answer: answers,
      },
    });
  }

  async getAnswerDataToChange(
    validatedFeedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
    existingAnswer: FeedbackAnswer | null,
    answers?: string[],
  ) {
    const isLastAnswer =
      currentQuestion.serialNumber === validatedFeedback.totalQuestions;

    const dataToChange: Prisma.FeedbackResultUpdateInput = {
      pointsValue:
        answers && !existingAnswer
          ? validatedFeedback.pointsValue + 10
          : undefined,
    };

    if (!isLastAnswer) {
      await this.modifyChangeDataIfNotLastAnswer(currentQuestion, dataToChange);
    }

    if (isLastAnswer) {
      this.modifyChangeDataIfLastAnswer(dataToChange);
    }

    if (answers && !existingAnswer) {
      dataToChange.answeredQuestions = validatedFeedback.answeredQuestions + 1;
    }
    return dataToChange;
  }

  async modifyChangeDataIfNotLastAnswer(
    currentQuestion: FeedbackQuestion,
    dataToChange: Prisma.FeedbackResultUpdateInput,
  ) {
    const nextQuestion = await this.prisma.feedbackQuestion.findFirst({
      where: {
        serialNumber: currentQuestion.serialNumber + 1,
      },
    });

    if (!nextQuestion) {
      throw new NotFoundException('Could not find next question');
    }

    dataToChange.currentQuestion = {
      connect: {
        id: nextQuestion.id,
      },
    };
  }

  modifyChangeDataIfLastAnswer(dataToChange: Prisma.FeedbackResultUpdateInput) {
    dataToChange.status = FeedbackStatus.completed;
    dataToChange.completedAt = new Date();
    dataToChange.currentQuestion = { disconnect: true };
  }

  validateAnswerOrThrow(
    feedback: FeedbackResultWithCurrentQuestion | null,
    answers?: string[],
  ) {
    if (!feedback || !feedback.currentQuestion) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }
    const currentQuestion = feedback.currentQuestion;
    const { type } = currentQuestion;

    const translation = currentQuestion.translations[0];

    if (!translation) {
      throw new NotFoundException(
        'Unable to answer question. No translation was found for selected language.',
      );
    }

    const options = translation.options;

    if (!answers) {
      return { feedback, currentQuestion };
    }

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

    return { feedback, currentQuestion };
  }
}
