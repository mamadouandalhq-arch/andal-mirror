import { Prisma } from '@prisma/client';
import { CreateFeedbackQuestionTranslationDto } from '../dto';

export function mapQuestionTranslations(
  translations: CreateFeedbackQuestionTranslationDto[],
): Prisma.FeedbackQuestionTranslationCreateNestedManyWithoutQuestionInput {
  return {
    create: translations.map((t) => ({
      language: t.language,
      text: t.text,
    })),
  };
}
