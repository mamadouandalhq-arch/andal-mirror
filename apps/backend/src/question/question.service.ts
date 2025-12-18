import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackQuestionDto, UpdateFeedbackQuestionDto } from './dto';
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
      where: {
        isArchived: false,
      },
      include: feedbackQuestionWithRelationsIncludeConst,
    });
  }

  async duplicateAndEdit(questionId: string, dto: UpdateFeedbackQuestionDto) {
    const originalQuestion = await this.getUniqueOrThrow(questionId);

    const baseCreateDto = mapFeedbackQuestionToCreateDto(originalQuestion);

    await this.prisma.feedbackQuestion.update({
      where: { id: questionId },
      data: { isArchived: true },
    });

    const mergedDto: CreateFeedbackQuestionDto = {
      ...baseCreateDto,
      ...dto,

      translations: dto.translations ?? baseCreateDto.translations,
      options: dto.options ?? baseCreateDto.options,
    };

    return this.create(mergedDto);
  }

  async getUniqueOrThrow(questionId: string) {
    const question = await this.prisma.feedbackQuestion.findUnique({
      where: {
        id: questionId,
        isArchived: false,
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
