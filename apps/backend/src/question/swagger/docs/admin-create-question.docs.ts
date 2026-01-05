import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { getBadRequestDocExample } from '../../../common';
import { feedbackQuestionExampleConst } from '../consts';

export function AdminCreateQuestionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create feedback question',
      description:
        'Creates a new feedback question with translations and options.',
    }),

    ApiOkResponse({
      description: 'Question successfully created',
      content: {
        'application/json': {
          example: feedbackQuestionExampleConst,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Invalid request body',
      content: {
        'application/json': {
          example: getBadRequestDocExample([
            'type must be one of the following values: single, multiple, text',
            'translations must be an array',
            'options must be an array',
          ]),
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
