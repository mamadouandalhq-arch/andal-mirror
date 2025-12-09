import { currentQuestionExample } from './current-question-example.const';
import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedbackInProgressExample = {
  status: 'in_progress',
  totalQuestions: 3,
  earnedCents: 0,
  answered_questions: 0,
  current_question: currentQuestionExample,
} satisfies FeedbackResultSwaggerDto;
