import { Prisma } from '@prisma/client';
import { CreateFeedbackQuestionDto } from '../dto';
import { mapFeedbackOptions } from './feedback-option.mapper';
import { mapQuestionTranslations } from './question-translations.mapper';

export function mapCreateFeedbackQuestion(
  dto: CreateFeedbackQuestionDto,
): Prisma.FeedbackQuestionCreateInput {
  return {
    type: dto.type,
    translations: mapQuestionTranslations(dto.translations),
    options: mapFeedbackOptions(dto.options),
  };
}
