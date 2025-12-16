import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';
import { BadRequestSwaggerDto } from '../dto';
import { feedbackInProgressExample } from '../consts';

export function StartFeedbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Starts a feedback session state.',
      description:
        'Start a feedback session if user is able to do it. If initialized, returns its current state, in different scenarios throws an error',
    }),
    ApiOkResponse({
      description:
        'Feedback session successfully started. Returns its current state.',
      content: {
        'application/json': {
          example: feedbackInProgressExample,
        },
      },
    }),
    ApiExtraModels(BadRequestSwaggerDto),
    ApiBadRequestResponse({
      description:
        'Bad Request exception — two possible validation errors: "Feedback already provided" or "No pending receipt!". See examples for details.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            $ref: getSchemaPath(BadRequestSwaggerDto),
          },
          examples: {
            feedbackAlreadyProvided: {
              summary: 'Feedback already provided',
              value: getBadRequestDocExample('Feedback already provided!'),
            },
            noPendingReceipt: {
              summary: 'No pending receipt',
              value: getBadRequestDocExample('No pending receipt!'),
            },
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Related resource not found',
      content: {
        'application/json': {
          examples: {
            translationNotFound: {
              summary: 'Translation not found',
              value: {
                statusCode: 404,
                message:
                  "Unable to create question. No translations were found for 'en'",
              },
            },
            optionCouldNotBeFound: {
              summary: 'Option could not be found',
              value: {
                statusCode: 404,
                message: "Option with key 'option1' not found",
              },
            },
          },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Feedback session was already started.',
      content: {
        'application/json': {
          example: {
            message: 'Feedback already in progress.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      },
    }),
  );
}
