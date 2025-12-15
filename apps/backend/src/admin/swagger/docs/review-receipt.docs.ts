import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { reviewedReceiptExample } from '../consts';

export function ReviewReceiptDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Review receipt',
      description: `
Approve or reject a user receipt.

Business rules:
- Points are awarded ONLY when receipt status changes from 'pending' to 'approved'
- Re-approving an already approved receipt does NOT award points again
- Rejecting a receipt never awards points
- Endpoint is idempotent for repeated approve actions

Admin only.
      `,
    }),

    ApiOkResponse({
      description: 'Receipt successfully reviewed',
      content: {
        'application/json': {
          example: reviewedReceiptExample,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Invalid request body',
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: [
              'receiptId must be a string',
              'receiptId should not be empty',
              'status must be one of the following values: approved, rejected',
            ],
            error: 'Bad Request',
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
      description: 'Forbidden resource (admin access required)',
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
      description: 'Receipt or related user not found',
      content: {
        'application/json': {
          examples: {
            receiptNotFound: {
              summary: 'Receipt not found',
              value: {
                statusCode: 404,
                message: 'Receipt not found',
              },
            },
            userNotFound: {
              summary: 'User not found',
              value: {
                statusCode: 404,
                message: 'User not found',
              },
            },
          },
        },
      },
    }),
  );
}
