import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function AdminGetUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description:
        'Returns a list of all users with basic information, receipt count, redemption count, and risk assessment. Admin only.',
    }),

    ApiOkResponse({
      description: 'Users retrieved successfully',
      content: {
        'application/json': {
          example: [
            {
              id: 'b7fc63e5-4798-48a0-b9c2-1652dd06796e',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              pointsBalance: 1500,
              createdAt: '2024-01-15T10:30:00.000Z',
              receiptsCount: 3,
              redemptionsCount: 1,
              riskLevel: 'low',
              riskAssessment: {
                averagePercentage: 75.5,
                completedSurveys: 2,
              },
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
      description: 'Forbidden. User does not have admin role',
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
