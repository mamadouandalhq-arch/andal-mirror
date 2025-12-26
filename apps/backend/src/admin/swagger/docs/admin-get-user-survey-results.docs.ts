import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function AdminGetUserSurveyResultsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user survey results for chart visualization',
      description:
        'Returns survey results data for a user, limited to the last 30 completed surveys. ' +
        'Each result includes date, satisfaction percentage, and question statistics. ' +
        'Data is sorted chronologically (oldest first) for chart display. ' +
        'Used for visualizing satisfaction trends over time. Admin only.',
    }),

    ApiParam({
      name: 'id',
      description: 'User id',
      example: 'b7fc63e5-4798-48a0-b9c2-1652dd06796e',
    }),

    ApiOkResponse({
      description: 'Survey results retrieved successfully',
      content: {
        'application/json': {
          example: [
            {
              date: '2024-12-24T10:30:00.000Z',
              percentage: 100.0,
              completedAt: '2024-12-24T10:30:00.000Z',
              answeredQuestions: 3,
              totalQuestions: 3,
            },
            {
              date: '2024-12-26T14:20:00.000Z',
              percentage: 30.0,
              completedAt: '2024-12-26T14:20:00.000Z',
              answeredQuestions: 3,
              totalQuestions: 3,
            },
            {
              date: '2024-12-27T09:15:00.000Z',
              percentage: 80.0,
              completedAt: '2024-12-27T09:15:00.000Z',
              answeredQuestions: 3,
              totalQuestions: 3,
            },
          ],
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Unauthorized',
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
      description: 'Forbidden. User does not have admin access',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'Forbidden resource',
          },
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'User not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'User not found',
          },
        },
      },
    }),
  );
}

