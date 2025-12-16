import { FeedbackOptionDto } from '@shared/feedback';

export class FeedbackQuestionDto {
  id!: string;
  serialNumber!: number;
  text!: string;
  type!: 'single' | 'multiple';
  options!: FeedbackOptionDto[];
  currentAnswer?: string[];

  static create(data: FeedbackQuestionDto): FeedbackQuestionDto {
    return Object.assign(new FeedbackQuestionDto(), data);
  }
}
