import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  receiptWithFeedbackAndUserExample,
  receiptWithoutFeedbackWithUserExample,
} from '../consts';

export function AdminGetReceiptDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get receipt by id',
      description:
        'Returns a single receipt by its id including related feedback result. Feedback result may be null. Admin only.',
    }),

    ApiParam({
      name: 'id',
      description: 'Receipt id',
      example: 'b7fc63e5-4798-48a0-b9c2-1652dd06796e',
    }),

    ApiOkResponse({
      description:
        'Receipt retrieved successfully. User info is attached to a receipt. Feedback result attached to a receipt might be null.',
      content: {
        'application/json': {
          examples: {
            receiptWithFeedbackResult: {
              summary: 'Receipt with feedback result',
              value: receiptWithFeedbackAndUserExample,
            },
            receiptWithoutFeedbackResult: {
              summary: 'Receipt without feedback result',
              value: receiptWithoutFeedbackWithUserExample,
            },
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
      description: 'Receipt not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: "Receipt with id 'receipt-id' not found",
          },
        },
      },
    }),
  );
}
