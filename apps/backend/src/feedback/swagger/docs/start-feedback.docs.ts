import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';
import { currentQuestionExample } from '../consts';
import { BadRequestSwaggerDto } from '../dto';

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
          example: {
            status: 'in_progress',
            totalQuestions: 3,
            earnedCents: 0,
            answered_questions: 0,
            current_question: currentQuestionExample,
          },
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
