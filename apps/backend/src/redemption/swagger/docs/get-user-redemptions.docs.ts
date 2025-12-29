import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { redemptionExample } from '../consts';

export function GetUserRedemptionsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all redemption requests for the authenticated user',
      description:
        'Returns a list of all redemption requests created by the authenticated user, ordered by creation date (newest first).',
    }),
    ApiOkResponse({
      description: 'List of redemption requests retrieved successfully',
      content: {
        'application/json': {
          example: [redemptionExample],
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
  );
}
