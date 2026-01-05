import { BadRequestException } from '@nestjs/common';

export function mapFeedbackAnswers(
  answers: Array<{
    answerKeys: string[];
    answerText?: string | null;
    question: {
      type: string;
      translations: { text: string }[];
      options: {
        key: string;
        translations: { label: string }[];
      }[];
    };
  }>,
): Array<{ question: string; answer: string }> {
  return answers.map((answerItem) => {
    const questionText = answerItem.question.translations[0]?.text;

    if (!questionText) {
      throw new BadRequestException('Question translation not found');
    }

    // Handle text-type questions
    if (answerItem.question.type === 'text') {
      return {
        question: questionText,
        answer: answerItem.answerText || '',
      };
    }

    // Handle single/multiple-type questions
    const labels = answerItem.answerKeys.map((key) => {
      const option = answerItem.question.options.find((o) => o.key === key);

      if (!option) {
        throw new BadRequestException(
          `Option with key '${key}' not found for question`,
        );
      }

      const label = option.translations[0]?.label;

      if (!label) {
        throw new BadRequestException(
          `Translation not found for option '${key}'`,
        );
      }

      return label;
    });

    return {
      question: questionText,
      answer: labels.join(', '),
    };
  });
}
