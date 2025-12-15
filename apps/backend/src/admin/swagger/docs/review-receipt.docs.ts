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
      description:
        'Approve or reject a receipt uploaded by a user. Only available for admins.',
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
      description: 'Forbidden resource',
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
      description: 'Receipt not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Receipt not found',
          },
        },
      },
    }),
  );
}
