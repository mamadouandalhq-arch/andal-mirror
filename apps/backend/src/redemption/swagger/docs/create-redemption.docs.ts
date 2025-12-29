import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';
import { redemptionExample } from '../consts';

export function CreateRedemptionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create redemption request',
      description: `
Create a new redemption request to convert points to cash.

Business rules:
- Minimum redemption amount is 100 points
- Points are deducted from user balance immediately upon creation
- Exchange rate: 100 points = $1.00
- User must have sufficient points balance
      `,
    }),
    ApiOkResponse({
      description: 'Redemption request created successfully',
      content: {
        'application/json': {
          example: redemptionExample,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request or insufficient points',
      content: {
        'application/json': {
          examples: {
            insufficientPoints: {
              summary: 'Insufficient points balance',
              value: getBadRequestDocExample('Insufficient points balance'),
            },
            invalidAmount: {
              summary: 'Invalid points amount',
              value: getBadRequestDocExample(
                'pointsAmount must not be less than 100',
              ),
            },
            invalidEmail: {
              summary: 'Invalid email',
              value: getBadRequestDocExample('paymentEmail must be an email'),
            },
          },
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
