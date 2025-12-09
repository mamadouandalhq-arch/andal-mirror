import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function UpdateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user', description: 'Updates user' }),
    ApiOkResponse({
      description: 'User successfully updated',
      content: {
        'application/json': {
          example: {
            id: '4ad2d9f0-67bf-43c2-820b-caeb75c6360e',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@gmail.com',
            address: 'New York, 221B Baker Street',
            avatar_url: 'https://cdn.example.com/avatar.png',
            role: 'user',
            points_balance: 0,
            created_at: '2025-12-02T13:50:20.589Z',
            google_id: null,
          },
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
