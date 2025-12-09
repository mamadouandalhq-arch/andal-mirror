export type FeedbackQuestionDto = {
  id: string;
  serial_number: number;
  text: string;
  type: 'single' | 'multiple';
  options: string[];
  created_at: Date;
};
