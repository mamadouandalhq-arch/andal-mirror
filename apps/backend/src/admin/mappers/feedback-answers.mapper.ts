export function mapFeedbackAnswers(
  answers: {
    answer: string[];
    question: {
      translations: { text: string }[];
    };
  }[],
) {
  return answers.map((a) => ({
    question: a.question.translations[0]?.text ?? '',
    answer: a.answer.join(', '),
  }));
}
