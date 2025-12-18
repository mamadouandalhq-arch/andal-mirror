import { Prisma } from '@prisma/client';
import { CreateFeedbackOptionTranslationDto } from '../dto';

export function mapOptionTranslations(
  translations: CreateFeedbackOptionTranslationDto[],
): Prisma.FeedbackOptionTranslationCreateNestedManyWithoutOptionInput {
  return {
    create: translations.map((t) => ({
      language: t.language,
      label: t.label,
    })),
  };
}
