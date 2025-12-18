import { feedbackQuestionExampleConst } from '../consts';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function AdminGetQuestionsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all feedback questions',
      description:
        'Returns all feedback questions with translations and options.',
    }),

    ApiOkResponse({
      description: 'List of feedback questions',
      content: {
        'application/json': {
          example: [feedbackQuestionExampleConst],
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'User is not authenticated',
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'User does not have admin permissions',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'Forbidden resource',
          },
        },
      },
    }),
  );
}
