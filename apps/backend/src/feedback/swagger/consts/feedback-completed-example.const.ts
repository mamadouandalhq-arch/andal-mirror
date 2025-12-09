import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedBackCompletedExample = {
  status: 'completed',
  total_questions: 3,
  earned_cents: 300,
  answered_questions: 3,
} satisfies FeedbackResultSwaggerDto;
