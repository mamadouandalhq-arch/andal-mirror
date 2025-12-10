import { FeedbackQuestionDto, FeedbackStatus } from '@shared/feedback';

export class FeedbackAvailableResponse {
  status!: FeedbackStatus;
  totalQuestions!: number;
  answeredQuestions!: number;
  earnedCents!: number;
  currentQuestion?: FeedbackQuestionDto | null;
}
