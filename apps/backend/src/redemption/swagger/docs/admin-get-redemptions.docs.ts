import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RedemptionStatus } from '@prisma/client';
import { redemptionWithUserExample } from '../consts';

export function AdminGetRedemptionsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all redemption requests (Admin only)',
      description:
        'Returns a list of all redemption requests. Can be filtered by status and userId. Accessible only for admins. Includes user information for each redemption.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: RedemptionStatus,
      description: 'Filter redemptions by status',
      example: RedemptionStatus.pending,
    }),
    ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description: 'Filter redemptions by user ID',
      example: '7d6b6b5e-38fe-4fe4-8a4a-25cb0f7b7e56',
    }),
    ApiOkResponse({
      description: 'Redemptions retrieved successfully',
      content: {
        'application/json': {
          example: [redemptionWithUserExample],
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
