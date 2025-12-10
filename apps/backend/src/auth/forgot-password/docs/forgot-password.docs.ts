import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ForgotPasswordDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request forgot-password email',
      description:
        'Always returns true even if the user does not exist - to prevent account enumeration.',
    }),
    ApiOkResponse({
      description:
        'If the email exists - password reset token was created and email was sent. If the email does not exist - still returns true.',
      content: {
        'application/json': {
          example: {
            success: true,
          },
        },
      },
    }),
  );
}
