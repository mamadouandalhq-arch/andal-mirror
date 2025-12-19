import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';
import { activeSurveyExampleConst } from './active-survey-example.const';

export function CreateActiveSurveyDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create active survey',
      description: `
Creates a new active survey.

Behavior:
- Deactivates the currently active survey (if exists)
- Creates a new survey with provided questions
- Question order is defined by the order of questionIds in request body
- Archived or non-existing questions are not allowed
      `,
    }),

    ApiCreatedResponse({
      description: 'Active survey created successfully',
      content: {
        'application/json': {
          example: activeSurveyExampleConst,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation error',
      content: {
        'application/json': {
          example: getBadRequestDocExample([
            'questionIds must contain at least one valid UUID',
          ]),
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'One or more questions not found or archived',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message: 'One or more questions do not exist or are archived',
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
