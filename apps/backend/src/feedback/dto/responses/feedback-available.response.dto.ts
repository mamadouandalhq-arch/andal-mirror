import { FeedbackQuestion, FeedbackStatus } from '@prisma/client';

export type FeedbackAvailableResponse = {
  status: FeedbackStatus;
  totalQuestions: number;
  current_question: FeedbackQuestion;
  earnedCents: number;
};
