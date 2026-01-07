import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';

export function UpdateReceiptDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update receipt file',
      description:
        'Update receipt file. Only allowed for receipts with status "awaitingFeedback" (before feedback completion).',
    }),
    ApiOkResponse({
      description: 'Receipt file updated successfully',
      content: {
        'application/json': {
          example: {
            url: 'https://buy-purchasing-powers-bucket.s3.eu-central-1.amazonaws.com/receipts/8f6d3c2b-4e71-4c8e-9b76-b2f1cc52c89e-01J0B9K9W9P2XKZ7VQF3ZC4TQS',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid receipt status or missing file',
      content: {
        'application/json': {
          example: getBadRequestDocExample(
            'Receipt can only be updated before feedback is completed',
          ),
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
            error: 'Not Found',
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Receipt does not belong to the user',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'You do not have permission to update this receipt',
            error: 'Forbidden',
          },
        },
      },
    }),
    ApiPayloadTooLargeResponse({
      description: 'Uploaded file exceeds maximum allowed size (5MB)',
      content: {
        'application/json': {
          example: {
            statusCode: 413,
            message: 'File too large',
            error: 'Payload Too Large',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User unauthorized',
      content: {
        'application/json': {
          example: {
            message: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description:
        'Update receipt file. Allowed file types: JPEG, PNG, WEBP, PDF. Maximum file size: 5MB. Only allowed for receipts with status "awaitingFeedback".',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Receipt file (JPEG, PNG, WEBP, PDF). Max size: 5MB.',
          },
        },
        required: ['file'],
      },
    }),
  );
}

