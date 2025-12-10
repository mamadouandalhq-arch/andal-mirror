import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function VerifyTokenDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'An endpoint to verify forgot-password-token',
    }),
    ApiOkResponse({
      description: 'Token is valid or invalid',
      content: {
        'application/json': {
          examples: {
            valid: {
              value: { success: true },
            },
            invalid: {
              value: { success: false },
            },
          },
        },
      },
    }),
  );
}
