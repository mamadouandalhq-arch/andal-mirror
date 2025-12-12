import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FeedbackStatus, ReceiptStatus } from '@prisma/client';
import { receiptWithUserExample } from '../consts';

export function AdminGetReceiptsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get receipts with optional feedback status filter',
      description:
        'Returns a list of receipts. Can be filtered by feedback status and receipt status. Accessible only for admins. Also, returns a user connected to the receipt',
    }),

    ApiQuery({
      name: 'feedbackStatus',
      required: false,
      enum: FeedbackStatus,
      description: 'Filter receipts by feedback status',
      example: FeedbackStatus.inProgress,
    }),

    ApiQuery({
      name: 'status',
      required: false,
      enum: ReceiptStatus,
      description: 'Filter receipts by status',
      example: ReceiptStatus.pending,
    }),

    ApiOkResponse({
      description: 'Receipts retrieved successfully',
      content: {
        'application/json': {
          example: [receiptWithUserExample],
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
            message: 'Forbidden',
          },
        },
      },
    }),
  );
}
