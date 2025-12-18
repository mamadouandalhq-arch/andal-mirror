import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';

export function UploadAvatarDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload user avatar',
      description: 'Upload and set a new user avatar',
    }),

    ApiOkResponse({
      description: 'Avatar uploaded successfully',
      content: {
        'application/json': {
          example: {
            avatarUrl:
              'https://buy-purchasing-powers-bucket.s3.eu-central-1.amazonaws.com/avatars/8f6d3c2b-4e71-4c8e-9b76-b2f1cc52c89e-01J0B9K9W9P2XKZ7VQF3ZC4TQS',
          },
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Invalid file or request',
      content: {
        'application/json': {
          examples: {
            fileMissing: {
              summary: 'File missing',
              value: getBadRequestDocExample('File is missing in the request'),
            },
            invalidMimeType: {
              summary: 'Invalid file type',
              value: getBadRequestDocExample(
                'Invalid file type. Allowed types: image/jpeg, image/png, image/webp',
              ),
            },
          },
        },
      },
    }),

    ApiPayloadTooLargeResponse({
      description: 'Uploaded file exceeds size limit (5MB)',
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
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      },
    }),

    ApiConsumes('multipart/form-data'),

    ApiBody({
      description: 'Avatar image file',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['file'],
      },
    }),
  );
}
