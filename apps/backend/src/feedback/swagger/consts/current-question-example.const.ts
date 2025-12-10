import { FeedbackQuestionDto } from '@shared/feedback';

export const currentQuestionExample = FeedbackQuestionDto.create({
  id: '56f51aa5-5cd3-443d-a99a-6ba9cb93a513',
  serialNumber: 1,
  text: 'How would you rate your apartment condition?',
  type: 'single',
  options: ['1', '2', '3', '4', '5'],
});
