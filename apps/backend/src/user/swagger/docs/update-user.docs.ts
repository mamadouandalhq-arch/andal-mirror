import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userExample } from '../consts';

export function UpdateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user', description: 'Updates user' }),
    ApiOkResponse({
      description: 'User successfully updated',
      content: {
        'application/json': {
          example: userExample,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      content: {
        'application/json': {
          example: {
            message: 'User not found',
            error: 'Not found',
            statusCode: 404,
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
  );
}
