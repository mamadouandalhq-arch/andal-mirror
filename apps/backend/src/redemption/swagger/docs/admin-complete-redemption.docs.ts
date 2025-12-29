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
import { redemptionExample } from '../consts';
import { getBadRequestDocExample } from '../../../common';

export function AdminCompleteRedemptionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete redemption request (Admin only)',
      description: `
Mark redemption request as completed after payment has been sent.

Business rules:
- Can only complete redemptions with 'approved' status
- Points remain deducted from user balance
- Admin only endpoint
      `,
    }),
    ApiParam({
      name: 'id',
      description: 'Redemption request ID',
      example: 'e3c6a0c4-9f4c-4a2c-bd9f-fb98c72da8af',
    }),
    ApiOkResponse({
      description: 'Redemption request completed successfully',
      content: {
        'application/json': {
          example: {
            ...redemptionExample,
            status: 'completed',
            approvedAt: '2025-12-11T11:00:00.000Z',
            completedAt: '2025-12-11T12:00:00.000Z',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Redemption cannot be completed',
      content: {
        'application/json': {
          example: getBadRequestDocExample(
            'Redemption can only be completed from approved status',
          ),
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Redemption request not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Redemption not found',
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
