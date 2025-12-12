import { currentQuestionExample } from './current-question-example.const';
import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export const feedbackInProgressExample = {
  status: 'inProgress',
  totalQuestions: 3,
  pointsValue: 10,
  answeredQuestions: 1,
  currentQuestion: currentQuestionExample,
} satisfies FeedbackResultSwaggerDto;
