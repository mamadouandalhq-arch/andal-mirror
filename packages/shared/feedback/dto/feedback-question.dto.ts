export class FeedbackQuestionDto {
  id!: string;
  serial_number!: number;
  text!: string;
  type!: 'single' | 'multiple';
  options!: string[];
}
