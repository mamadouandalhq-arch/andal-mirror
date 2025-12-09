import { FeedbackQuestionDto, FeedbackStatus } from '@shared/feedback';

export class FeedbackAvailableResponse {
  status!: FeedbackStatus;
  total_questions!: number;
  answered_questions!: number;
  earned_cents!: number;
  current_question?: FeedbackQuestionDto;
}
