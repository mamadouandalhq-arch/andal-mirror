import { feedbackQuestionExampleConst } from '../consts';
import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function AdminGetQuestionByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get feedback question by id',
      description: 'Returns a single feedback question with full structure.',
    }),

    ApiOkResponse({
      description: 'Feedback question',
      example: feedbackQuestionExampleConst,
    }),

    ApiNotFoundResponse({
      description: 'Question not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Question not found',
          },
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
