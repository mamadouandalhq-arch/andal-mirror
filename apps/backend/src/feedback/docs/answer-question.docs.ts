import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../common';

export function AnswerQuestionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'An endpoint to send an answer to a current question.',
      description: `An endpoint to send an answer to a current question. Current question is provided by /feedback/state endpoint or by previous response of /feedback/answer-question. Returns current feedback session state if OK, else throws an error. If OK, response.current_question becomes user's next question`,
    }),
    ApiOkResponse({
      description:
        'Question answered successfully. Response depends on whether the feedback session continues or has been completed.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['in_progress', 'completed'],
                description:
                  'Current feedback session status after answering a question.',
                example: 'in_progress',
              },
              totalQuestions: {
                type: 'number',
                description:
                  'Total number of questions in this feedback session.',
              },
              earnedCents: {
                type: 'number',
                description:
                  'Total number of cents earned by the user at this point.',
              },
              answered_questions: {
                type: 'number',
                description: 'How many questions user has answered so far.',
              },
              current_question: {
                type: 'object',
                nullable: true,
                description:
                  'Next question that user should answer. Returned only if status = in_progress.',
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
              summary: 'Next question returned',
              value: {
                status: 'in_progress',
                totalQuestions: 3,
                earnedCents: 100,
                answered_questions: 1,
                current_question: {
                  id: '00341d1f-87f8-4ec9-8255-5503fc61e2bc',
                  serial_number: 2,
                  text: 'How would you rate your relationship with landlord?',
                  type: 'single',
                  options: ['1', '2', '3', '4', '5'],
                  created_at: '2025-12-05T10:41:37.290Z',
                },
              },
            },

            completed: {
              summary:
                'Feedback session completed after answering this question',
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
    ApiBadRequestResponse({
      description: 'Validation errors for answering feedback questions',
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
            noActiveFeedback: {
              summary: 'No active feedback session',
              value: getBadRequestDocExample(
                "You don't provide any feedback right now.",
              ),
            },
            invalidAnswerOption: {
              summary: 'Provided answer is not in allowed options list',
              value: getBadRequestDocExample(
                'You provided invalid answer option.',
              ),
            },
            singleChoiceMustHaveOneAnswer: {
              summary: 'Single-choice question must have exactly one answer',
              value: getBadRequestDocExample(
                'Single-choice question must have exactly one answer',
              ),
            },
            duplicateAnswers: {
              summary: 'Duplicate answers are not allowed',
              value: getBadRequestDocExample(
                'Duplicate answers are not allowed',
              ),
            },
          },
        },
      },
    }),
    ApiConflictResponse({
      description:
        'User attempted to answer a question that was already answered',
      content: {
        'application/json': {
          example: {
            message: 'You already answered this question.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      },
    }),
  );
}
