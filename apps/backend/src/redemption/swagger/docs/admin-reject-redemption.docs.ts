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

export function AdminRejectRedemptionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reject redemption request (Admin only)',
      description: `
Reject a redemption request. Changes status to 'rejected' and returns points to user balance.

Business rules:
- Can reject redemptions with 'pending' or 'approved' status
- Points are returned to user balance
- Optional rejection reason can be provided
- Admin only endpoint
      `,
    }),
    ApiParam({
      name: 'id',
      description: 'Redemption request ID',
      example: 'e3c6a0c4-9f4c-4a2c-bd9f-fb98c72da8af',
    }),
    ApiOkResponse({
      description: 'Redemption request rejected successfully',
      content: {
        'application/json': {
          example: {
            ...redemptionExample,
            status: 'rejected',
            rejectedAt: '2025-12-11T12:00:00.000Z',
            rejectionReason: 'Invalid email',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Redemption cannot be rejected',
      content: {
        'application/json': {
          example: getBadRequestDocExample(
            'Redemption can only be rejected from pending or approved status',
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
