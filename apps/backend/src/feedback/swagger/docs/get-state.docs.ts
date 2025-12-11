import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  feedBackCompletedExample,
  feedbackInProgressExample,
  feedbackNotStartedExample,
  feedbackUnavailableExample,
} from '../consts';
import { FeedbackResultSwaggerDto } from '../dto/feedback-result.swagger.dto';

export function GetStateDocs() {
  return applyDecorators(
    ApiQuery({
      name: 'language',
      required: true,
      description: 'Language code as string',
      example: 'en',
    }),
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
              value: feedbackInProgressExample,
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
    ApiNotFoundResponse({
      description: 'Invalid current question or translation',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Invalid current question or translation',
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
