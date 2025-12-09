import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  currentQuestionExample,
  feedBackCompletedExample,
  feedbackNotStartedExample,
  feedbackUnavailableExample,
} from '../consts';
import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export function GetStateDocs() {
  return applyDecorators(
    ApiExtraModels(),
    ApiOperation({
      summary: 'Get feedback session state',
      description:
        'Returns current feedback session state. The response may vary depending on session status.',
    }),
    ApiExtraModels(FeedbackResultSwaggerDto),
    ApiOkResponse({
      description:
        'Returns feedback session state. Response shape depends on the session status. See examples for all possible variants.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            $ref: getSchemaPath(FeedbackResultSwaggerDto),
          },

          examples: {
            inProgress: {
              summary: 'Feedback session in progress',
              value: {
                status: 'in_progress',
                totalQuestions: 3,
                earnedCents: 0,
                answered_questions: 0,
                current_question: currentQuestionExample,
              },
            },

            notStarted: {
              summary: 'No session started yet',
              value: feedbackNotStartedExample,
            },

            unavailable: {
              summary:
                'User cannot start feedback because he has no valid receipt',
              value: feedbackUnavailableExample,
            },

            completed: {
              summary: 'Feedback session was already completed',
              value: feedBackCompletedExample,
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User unauthorized',
      content: {
        'application/json': {
          example: {
            message: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
  );
}
