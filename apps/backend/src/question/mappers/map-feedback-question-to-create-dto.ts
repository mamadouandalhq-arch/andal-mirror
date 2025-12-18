import { CreateFeedbackQuestionDto } from '../dto';
import { FeedbackQuestionWithRelationsType } from '../types';

export function mapFeedbackQuestionToCreateDto(
  question: FeedbackQuestionWithRelationsType,
): CreateFeedbackQuestionDto {
  return {
    type: question.type,

    translations: question.translations.map((t) => ({
      language: t.language,
      text: t.text,
    })),

    options: question.options.map((o) => ({
      key: o.key,
      order: o.order,
      score: o.score ?? undefined,
      translations: o.translations.map((ot) => ({
        language: ot.language,
        label: ot.label,
      })),
    })),
  };
}
