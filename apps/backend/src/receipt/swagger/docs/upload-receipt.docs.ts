import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';

export function UploadReceiptDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload receipt',
      description: 'Upload receipt',
    }),
    ApiOkResponse({
      description: 'Receipt upload successfully',
      content: {
        'application/json': {
          example: {
            url: 'https://buy-purchasing-powers-bucket.s3.eu-central-1.amazonaws.com/8f6d3c2b-4e71-4c8e-9b76-b2f1cc52c89e-01J0B9K9W9P2XKZ7VQF3ZC4TQS',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'User already has pending receipt',
      content: {
        'application/json': {
          example: getBadRequestDocExample(
            "You already have pending receipt! You can't create more than one pending receipt.",
          ),
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
        'Upload receipt file. Allowed file types: JPEG, PNG, WEBP, PDF. Maximum file size: 5MB.',
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
