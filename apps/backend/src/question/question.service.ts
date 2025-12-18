import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackQuestionDto } from './dto';
import {
  mapCreateFeedbackQuestion,
  mapFeedbackQuestionToCreateDto,
} from './mappers';
import { feedbackQuestionWithRelationsIncludeConst } from './consts';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.feedbackQuestion.findMany({
      include: feedbackQuestionWithRelationsIncludeConst,
    });
  }

  async duplicate(questionId: string) {
    const question = await this.getUniqueOrThrow(questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const dto: CreateFeedbackQuestionDto =
      mapFeedbackQuestionToCreateDto(question);

    return this.create(dto);
  }

  async getUniqueOrThrow(questionId: string) {
    const question = await this.prisma.feedbackQuestion.findUnique({
      where: {
        id: questionId,
      },
      include: feedbackQuestionWithRelationsIncludeConst,
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(dto: CreateFeedbackQuestionDto) {
    return this.prisma.feedbackQuestion.create({
      data: mapCreateFeedbackQuestion(dto),
      include: feedbackQuestionWithRelationsIncludeConst,
    });
  }
}
