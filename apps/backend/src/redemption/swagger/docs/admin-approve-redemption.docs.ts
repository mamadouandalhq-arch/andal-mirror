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

export function AdminApproveRedemptionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve redemption request (Admin only)',
      description: `
Approve a redemption request. Changes status from 'pending' to 'approved'.

Business rules:
- Can only approve redemptions with 'pending' status
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
      description: 'Redemption request approved successfully',
      content: {
        'application/json': {
          example: {
            ...redemptionExample,
            status: 'approved',
            approvedAt: '2025-12-11T11:00:00.000Z',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Redemption cannot be approved',
      content: {
        'application/json': {
          example: getBadRequestDocExample(
            'Redemption can only be approved from pending status',
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

