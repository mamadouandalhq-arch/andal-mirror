import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../common';

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
            current_question: {
              id: '56f51aa5-5cd3-443d-a99a-6ba9cb93a513',
              serial_number: 1,
              text: 'How would you rate your apartment condition?',
              type: 'single',
              options: ['1', '2', '3', '4', '5'],
              created_at: '2025-12-05T10:41:37.290Z',
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        'Bad Request exception — two possible validation errors: "Feedback already provided" or "No pending receipt!". See examples for details.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: 400 },
            },
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
