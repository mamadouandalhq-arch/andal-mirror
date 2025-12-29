import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function AdminGetUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by id',
      description:
        'Returns detailed information about a user including basic info, receipts, redemptions, and risk assessment. ' +
        'Risk assessment uses exponential decay weighting to prioritize recent surveys and detects declining trends. ' +
        'Use GET /admin/users/:id/survey-results to get survey data for chart visualization (limited to last 30 surveys). Admin only.',
    }),

    ApiParam({
      name: 'id',
      description: 'User id',
      example: 'b7fc63e5-4798-48a0-b9c2-1652dd06796e',
    }),

    ApiOkResponse({
      description: 'User retrieved successfully',
      content: {
        'application/json': {
          example: {
            id: 'b7fc63e5-4798-48a0-b9c2-1652dd06796e',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            city: 'Kyiv',
            street: 'Main Street',
            building: '25',
            apartment: '42',
            avatarUrl: 'https://example.com/avatar.jpg',
            pointsBalance: 1500,
            createdAt: '2024-01-15T10:30:00.000Z',
            riskAssessment: {
              level: 'low',
              averagePercentage: 75.5,
              totalScore: 45,
              maxPossibleScore: 60,
              completedSurveys: 2,
            },
            receipts: [
              {
                id: 'receipt-id-1',
                status: 'approved',
                createdAt: '2024-01-20T10:30:00.000Z',
                receiptUrl: 'https://example.com/receipt1.jpg',
              },
            ],
            redemptions: [
              {
                id: 'redemption-id-1',
                status: 'completed',
                pointsAmount: 1000,
                dollarAmount: 10.0,
                createdAt: '2024-01-25T10:30:00.000Z',
              },
            ],
          },
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
