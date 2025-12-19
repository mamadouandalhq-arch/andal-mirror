import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { activeSurveyExampleConst } from '../consts';

export function GetActiveSurveyDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get active survey',
      description: `
Returns the currently active survey with ordered questions. Only available for admin

- Only one survey can be active at a time
- Questions are returned in the exact order defined for the survey
- Archived questions are never included
      `,
    }),

    ApiOkResponse({
      description: 'Active survey retrieved successfully',
      content: {
        'application/json': {
          example: activeSurveyExampleConst,
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Active survey not found',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'Active survey not found',
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
      description: 'Admin access required',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'Forbidden',
          },
        },
      },
    }),
  );
}
