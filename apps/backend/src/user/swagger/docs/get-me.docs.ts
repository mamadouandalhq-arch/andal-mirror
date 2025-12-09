import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userExample } from '../consts';

export function GetMeDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get me',
      description: 'Get current user profile',
    }),
    ApiOkResponse({
      description: 'Successfully return current user',
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
