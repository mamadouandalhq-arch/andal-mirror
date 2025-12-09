import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function GoogleAuthRedirectDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth callback',
      description:
        'Handles Google OAuth redirect. Will redirect you to google OAuth consent screen if called directly',
    }),
    ApiResponse({
      status: 302,
      description:
        'Redirect to frontend. Frontend url being passed to /auth/google',
    }),
    ApiUnauthorizedResponse({
      description: 'User payload not found',
      content: {
        'application/json': {
          example: {
            message: 'Missing Google OAuth user payload',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
  );
}
