import { FeedbackQuestionDto, FeedbackStatus } from '@shared/feedback';

export class FeedbackAvailableResponse {
  status!: FeedbackStatus;
  totalQuestions!: number;
  answeredQuestions!: number;
  pointsValue!: number;
  currentQuestion?: FeedbackQuestionDto | null;
}
