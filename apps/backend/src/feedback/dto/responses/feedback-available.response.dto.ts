import { FeedbackQuestion, FeedbackStatus } from '@prisma/client';

export type FeedbackAvailableResponse = {
  status: FeedbackStatus;
  totalQuestions: number;
  answered_questions: number;
  earnedCents: number;
  current_question?: FeedbackQuestion;
};
