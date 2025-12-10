import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedbackUnavailableExample = {
  status: 'unavailable',
  reason: 'noPendingReceipt',
} satisfies FeedbackResultSwaggerDto;
