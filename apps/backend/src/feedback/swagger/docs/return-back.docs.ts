import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { BadRequestSwaggerDto, FeedbackResultInAnswerSwaggerDto } from '../dto';
import { getBadRequestDocExample } from '../../../common';
import { feedbackInProgressExample } from '../consts';

export function ReturnBackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return to the previous feedback question',
      description:
        'Moves feedback session one question back. Works only if feedback session is in progress. Returns updated feedback session state.',
    }),
    ApiExtraModels(FeedbackResultInAnswerSwaggerDto, BadRequestSwaggerDto),

    ApiOkResponse({
      description:
        'Successfully returned to the previous question. Returns updated feedback session state.',
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(FeedbackResultInAnswerSwaggerDto),
          },
          examples: {
            success: {
              summary: 'Returned to previous question',
              value: feedbackInProgressExample,
            },
          },
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Invalid return back operation',
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(BadRequestSwaggerDto),
          },
          examples: {
            noActiveFeedback: {
              summary: 'No active feedback session',
              value: getBadRequestDocExample(
                "You don't provide any feedback right now.",
              ),
            },
            firstQuestion: {
              summary: 'Trying to go back from the first question',
              value: getBadRequestDocExample(
                "You can't go back from the first question",
              ),
            },
          },
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Previous question does not exist',
      content: {
        'application/json': {
          example: {
            message: 'Previous question does not exist',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}
