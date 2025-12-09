import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function GetStateDocs() {
  return applyDecorators(
    ApiExtraModels(),
    ApiOperation({
      summary: 'Get feedback session state',
      description:
        'Returns current feedback session state. The response may vary depending on session status.',
    }),
    ApiOkResponse({
      description:
        'Returns feedback session state. Response shape depends on the session status. See examples for all possible variants.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: [
                  'in_progress',
                  'not_started',
                  'unavailable',
                  'completed',
                ],
                description: 'Current state of the feedback session.',
                example: 'in_progress',
              },
              totalQuestions: {
                type: 'number',
                description: 'Total questions in the feedback session.',
              },
              earnedCents: {
                type: 'number',
                description: 'Amount of US cents earned by a user this far.',
              },
              answered_questions: {
                type: 'number',
                description:
                  'Amount of answered questions in the feedback session.',
              },
              current_question: {
                type: 'object',
                nullable: true,
                description:
                  'Current question that user has to answer. Being returned only if feedback session is in progress.',
                properties: {
                  id: { type: 'string' },
                  serial_number: { type: 'number' },
                  text: { type: 'string' },
                  type: { type: 'string', enum: ['single'] },
                  options: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  created_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },

          examples: {
            inProgress: {
              summary: 'Feedback session in progress',
              value: {
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

            notStarted: {
              summary: 'No session started yet',
              value: {
                status: 'not_started',
              },
            },

            unavailable: {
              summary:
                'User cannot start feedback because he has no valid receipt',
              value: {
                status: 'unavailable',
                reason: 'no_pending_receipt',
              },
            },

            completed: {
              summary: 'Feedback session was already completed',
              value: {
                status: 'completed',
                totalQuestions: 3,
                earnedCents: 300,
                answered_questions: 3,
              },
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
