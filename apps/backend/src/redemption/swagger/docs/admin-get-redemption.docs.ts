import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { redemptionWithUserExample } from '../consts';

export function AdminGetRedemptionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get redemption request by ID (Admin only)',
      description:
        'Returns a single redemption request with user information. Accessible only for admins.',
    }),
    ApiParam({
      name: 'id',
      description: 'Redemption request ID',
      example: 'e3c6a0c4-9f4c-4a2c-bd9f-fb98c72da8af',
    }),
    ApiOkResponse({
      description: 'Redemption request retrieved successfully',
      content: {
        'application/json': {
          example: redemptionWithUserExample,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Redemption request not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Redemption not found',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden. User does not have admin role',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'Forbidden resource',
          },
        },
      },
    }),
  );
}
