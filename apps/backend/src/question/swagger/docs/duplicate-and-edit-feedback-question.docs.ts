import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { feedbackQuestionExampleConst } from '../consts';
import { getBadRequestDocExample } from '../../../common';

export function DuplicateAndEditFeedbackQuestionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Duplicate and edit feedback question',
      description:
        'Creates a new feedback question by duplicating an existing one and applying provided changes. ' +
        'The original question is automatically archived and will no longer appear in regular queries.',
    }),

    ApiParam({
      name: 'id',
      description: 'ID of the feedback question to duplicate',
      example: feedbackQuestionExampleConst.id,
    }),

    ApiOkResponse({
      description: 'Feedback question duplicated and edited successfully',
      content: {
        'application/json': {
          example: feedbackQuestionExampleConst,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Invalid request body or validation error',
      content: {
        'application/json': {
          example: getBadRequestDocExample([
            'options must be an array',
            'each value in nested property options must be either object or array',
          ]),
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Original feedback question was not found',
      content: {
        'application/json': {
          example: {
            message: 'Question not found',
            statusCode: 404,
          },
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'User is not authenticated',
      content: {
        'application/json': {
          example: {
            message: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),

    ApiForbiddenResponse({
      description: 'User does not have permission to manage questions',
      content: {
        'application/json': {
          example: {
            message: 'Forbidden',
            statusCode: 403,
          },
        },
      },
    }),
  );
}
