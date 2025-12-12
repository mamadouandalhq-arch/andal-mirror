import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedBackCompletedExample = {
  status: 'completed',
  totalQuestions: 3,
  pointsValue: 30,
  answeredQuestions: 3,
} satisfies FeedbackResultSwaggerDto;
