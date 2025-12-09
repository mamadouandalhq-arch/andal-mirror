import {
  FeedbackAvailableResponse,
  FeedbackNotStartedResponse,
  FeedbackUnavailableResponse,
} from '@shared/feedback';

export type FeedbackStateResponse =
  | FeedbackAvailableResponse
  | FeedbackUnavailableResponse
  | FeedbackNotStartedResponse;
