import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { receiptExample } from '../consts';

export function GetReceiptListDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all receipts for the authenticated user',
    }),
    ApiOkResponse({
      description: 'List of receipts retrieved successfully',
      content: {
        'application/json': {
          example: [receiptExample, receiptExample],
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User is not authenticated',
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      },
    }),
  );
}
