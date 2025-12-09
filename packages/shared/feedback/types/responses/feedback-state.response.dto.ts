import { FeedbackUnavailableResponse } from './feedback-unavailable.response.dto';
import { FeedbackAvailableResponse } from './feedback-available.response.dto';
import { FeedbackNotStartedResponse } from './feedback-not-started.response.dto';

export type FeedbackStateResponse =
  | FeedbackAvailableResponse
  | FeedbackUnavailableResponse
  | FeedbackNotStartedResponse;
