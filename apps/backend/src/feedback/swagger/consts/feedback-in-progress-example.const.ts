import { currentQuestionExample } from './current-question-example.const';
import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedbackInProgressExample = {
  status: 'inProgress',
  totalQuestions: 3,
  earnedCents: 0,
  answeredQuestions: 0,
  currentQuestion: currentQuestionExample,
} satisfies FeedbackResultSwaggerDto;
