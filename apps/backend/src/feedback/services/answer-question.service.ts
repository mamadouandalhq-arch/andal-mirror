import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackResultWithCurrentQuestion } from '../types';
import { FeedbackQuestion, FeedbackStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnswerQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnswerAndThrowIfAnswered(
    feedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
  ) {
    const existingAnswer = await this.prisma.feedbackAnswer.findUnique({
      where: {
        feedback_result_id_question_id: {
          feedback_result_id: feedback.id,
          question_id: currentQuestion.id,
        },
      },
    });

    if (existingAnswer) {
      throw new ConflictException('You already answered this question.');
    }
  }

  async getAnswerDataToChange(
    validatedFeedback: FeedbackResultWithCurrentQuestion,
    currentQuestion: FeedbackQuestion,
  ) {
    const isLastAnswer =
      currentQuestion.serial_number === validatedFeedback.total_questions;

    const dataToChange: Prisma.FeedbackResultUpdateInput = {
      earned_cents: validatedFeedback.earned_cents + 100,
    };

    if (!isLastAnswer) {
      await this.modifyChangeDataIfNotLastAnswer(currentQuestion, dataToChange);
    }

    if (isLastAnswer) {
      this.modifyChangeDataIfLastAnswer(dataToChange);
    }

    dataToChange.answered_questions = validatedFeedback.answered_questions + 1;
    return dataToChange;
  }

  async modifyChangeDataIfNotLastAnswer(
    currentQuestion: FeedbackQuestion,
    dataToChange: Prisma.FeedbackResultUpdateInput,
  ) {
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

  modifyChangeDataIfLastAnswer(dataToChange: Prisma.FeedbackResultUpdateInput) {
    dataToChange.status = FeedbackStatus.completed;
    dataToChange.completed_at = new Date();
    dataToChange.current_question = { disconnect: true };
  }

  validateAnswerOrThrow(
    feedback: FeedbackResultWithCurrentQuestion | null,
    answers: string[],
  ) {
    if (!feedback || !feedback.current_question) {
      throw new BadRequestException(
        "You don't provide any feedback right now.",
      );
    }
    const currentQuestion = feedback.current_question;
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

    return { feedback, currentQuestion };
  }
}
