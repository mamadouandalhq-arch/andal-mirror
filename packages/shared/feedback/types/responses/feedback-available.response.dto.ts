import { FeedbackQuestionDto, FeedbackStatus } from '@shared/feedback';

export type FeedbackAvailableResponse = {
  status: FeedbackStatus;
  totalQuestions: number;
  answered_questions: number;
  earnedCents: number;
  current_question?: FeedbackQuestionDto;
};
