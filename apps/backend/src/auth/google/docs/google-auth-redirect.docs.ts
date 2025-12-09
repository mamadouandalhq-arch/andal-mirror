import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function GoogleAuthRedirectDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth callback',
      description:
        'Handles Google OAuth redirect. Will redirect you to google OAuth consent screen if called directly',
    }),
    ApiOkResponse({
      description: 'User logged in successfully',
      content: {
        'application/json': {
          example: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzNTgzYWVlLTc0ZGQtNDYxZi05NTgxLTZjNWUzODgxMjExYiIsImVtYWlsIjoiam9obi5zbWl0aEBnbWFpbC5jb20iLCJpYXQiOjE3NDcxMjIwMDQsImV4cCI6MTc0NzEyMjkwNH0.KFkuT5C4N9j3Fr4QtguRjvudMRdGiOfE5paJa-dfsWQ',
          },
        },
        'Set-Cookie': {
          example:
            'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzNTgzYWVlLTc0ZGQtNDYxZi05NTgxLTZjNWUzODgxMjExYiIsImVtYWlsIjoiam9obi5zbWl0aEBnbWFpbC5jb20iLCJpYXQiOjE3NDcxMjMyMzcsImV4cCI6MTc0NzcyODAzN30.J511v_mgONqF71KL8dcE2i8IxeT1yfuqaCgqznW5NAQ; Path=/; Expires=Tue, 20 May 2025 08:00:37 GMT; HttpOnly; Secure; SameSite=Lax',
        },
      },
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
