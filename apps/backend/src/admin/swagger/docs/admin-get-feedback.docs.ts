import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { feedbackWithAnswersExample } from '../consts';

export function AdminGetFeedbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get feedback by id (admin)',
      description: `
Returns a completed or in-progress feedback with resolved answers.

Behavior:
- Questions are returned in the requested language
- Answers are stored as option keys and resolved to localized labels
- Each answer is returned as a human-readable string
- Intended for admin / moderation / review purposes
      `,
    }),

    ApiParam({
      name: 'id',
      description: 'Feedback result ID',
      example: '288aef7a-7150-4431-9d9a-8dbc94e2d2df',
    }),

    ApiQuery({
      name: 'language',
      description: 'Language code used to resolve question and answer labels',
      example: 'fr',
      required: true,
    }),

    ApiOkResponse({
      description: 'Feedback successfully retrieved',
      content: {
        'application/json': {
          example: feedbackWithAnswersExample,
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Feedback not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Feedback not found',
          },
        },
      },
    }),
  );
}
