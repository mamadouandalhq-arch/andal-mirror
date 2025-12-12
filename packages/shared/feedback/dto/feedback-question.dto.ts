export class FeedbackQuestionDto {
  id!: string;
  serialNumber!: number;
  text!: string;
  type!: 'single' | 'multiple';
  options!: string[];
  currentAnswer?: string[];

  static create(data: FeedbackQuestionDto): FeedbackQuestionDto {
    return Object.assign(new FeedbackQuestionDto(), data);
  }
}
