import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ChangePasswordDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change user password using a forgot-password token',
    }),
    ApiOkResponse({
      description: 'Password changed successfully',
      content: {
        'application/json': {
          example: {
            success: false,
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid or expired token',
      content: {
        'application/json': {
          example: {
            success: false,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User or forgot password token not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'User not found',
          },
        },
      },
    }),
  );
}
