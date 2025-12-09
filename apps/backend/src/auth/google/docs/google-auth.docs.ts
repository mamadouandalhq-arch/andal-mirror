import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GoogleAuthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth flow',
      description: 'Redirects the user to Google OAuth consent screen.',
    }),
    ApiResponse({
      status: 302,
      description: 'Redirect to Google OAuth page',
    }),
    ApiQuery({
      name: 'state',
      description:
        'Frontend URL. Should start with frontend_url variable defined in environment',
      required: true,
      type: String,
    }),
  );
}
