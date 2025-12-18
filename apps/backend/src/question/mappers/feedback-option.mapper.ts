import { Prisma } from '@prisma/client';
import { CreateFeedbackOptionDto } from '../dto';
import { mapOptionTranslations } from './options-translations.mapper';

export function mapFeedbackOptions(
  options: CreateFeedbackOptionDto[],
): Prisma.FeedbackOptionCreateNestedManyWithoutQuestionInput {
  return {
    create: options.map((o) => ({
      key: o.key,
      order: o.order,
      score: o.score,
      translations: mapOptionTranslations(o.translations),
    })),
  };
}
