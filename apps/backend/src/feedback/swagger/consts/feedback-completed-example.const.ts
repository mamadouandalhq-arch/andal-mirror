import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedBackCompletedExample = {
  status: 'completed',
  totalQuestions: 3,
  earnedCents: 300,
  answeredQuestions: 3,
} satisfies FeedbackResultSwaggerDto;
