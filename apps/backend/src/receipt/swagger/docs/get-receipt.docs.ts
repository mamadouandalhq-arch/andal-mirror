import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { receiptExample } from '../consts';

export function GetReceiptDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a single receipt by ID',
    }),
    ApiOkResponse({
      description: 'Receipt retrieved successfully',
      content: {
        'application/json': {
          example: receiptExample,
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
    ApiNotFoundResponse({
      description: 'Receipt not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Receipt could not be found',
          },
        },
      },
    }),
  );
}
