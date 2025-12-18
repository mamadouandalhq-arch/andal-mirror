import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { feedbackQuestionExampleConst } from '../consts';

export function AdminDuplicateQuestionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Duplicate feedback question',
      description:
        'Creates a full copy of an existing feedback question including translations and options.',
    }),

    ApiOkResponse({
      description: 'Question successfully duplicated',
      content: {
        'application/json': {
          example: feedbackQuestionExampleConst,
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Original question not found',
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
