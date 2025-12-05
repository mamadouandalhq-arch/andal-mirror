import { FeedbackUnavailableResponse } from './feedback-unavailable.response.dto';
import { FeedbackAvailableResponse } from './feedback-available.response.dto';

// TODO: move to shared
export type FeedbackStateResponse =
  | FeedbackAvailableResponse
  | FeedbackUnavailableResponse;
