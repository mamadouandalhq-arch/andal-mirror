import { NotFoundException } from '@nestjs/common';
import { CurrentQuestionWithOptions } from '../types';

export function mapAnswerKeysFromQuestion(
  currentQuestion: CurrentQuestionWithOptions,
  key: string,
) {
  const option = currentQuestion.options.find((o) => o.key === key);

  if (!option) {
    throw new NotFoundException(`Option with key '${key}' not found`);
  }

  return option.key;
}
