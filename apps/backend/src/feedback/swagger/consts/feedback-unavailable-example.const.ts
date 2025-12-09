import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedbackUnavailableExample = {
  status: 'unavailable',
  reason: 'no_pending_receipt',
} satisfies FeedbackResultSwaggerDto;
