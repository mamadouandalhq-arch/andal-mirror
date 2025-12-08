import { FeedbackQuestionDto } from '../feedback-question.dto';
import { FeedbackStatusDto } from '@shared/feedback';

export type FeedbackAvailableResponse = {
  status: FeedbackStatusDto;
  totalQuestions: number;
  answered_questions: number;
  earnedCents: number;
  current_question?: FeedbackQuestionDto;
};
