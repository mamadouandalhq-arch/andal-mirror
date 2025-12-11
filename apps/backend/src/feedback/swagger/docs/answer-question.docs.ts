import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { getBadRequestDocExample } from '../../../common';
import { BadRequestSwaggerDto, FeedbackResultInAnswerSwaggerDto } from '../dto';
import { feedBackCompletedExample, feedbackInProgressExample } from '../consts';

export function AnswerQuestionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'An endpoint to send an answer to a current question.',
      description: `An endpoint to send an answer to a current question. Current question is provided by /feedback/state endpoint or by previous response of /feedback/answer-question. Returns current feedback session state if OK, else throws an error. If OK, response.current_question becomes user's next question`,
    }),
    ApiExtraModels(FeedbackResultInAnswerSwaggerDto, BadRequestSwaggerDto),
    ApiOkResponse({
      description:
        'Question answered successfully. Response depends on whether the feedback session continues or has been completed.',
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(FeedbackResultInAnswerSwaggerDto),
          },

          examples: {
            inProgress: {
              summary: 'Next question returned, feedback session in progress',
              value: feedbackInProgressExample,
            },

            completed: {
              summary:
                'Feedback session completed after answering this question',
              value: feedBackCompletedExample,
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validation errors for answering feedback questions',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            $ref: getSchemaPath(BadRequestSwaggerDto),
          },
          examples: {
            noActiveFeedback: {
              summary: 'No active feedback session',
              value: getBadRequestDocExample(
                "You don't provide any feedback right now.",
              ),
            },
            invalidAnswerOption: {
              summary: 'Provided answer is not in allowed options list',
              value: getBadRequestDocExample(
                'You provided invalid answer option.',
              ),
            },
            singleChoiceMustHaveOneAnswer: {
              summary: 'Single-choice question must have exactly one answer',
              value: getBadRequestDocExample(
                'Single-choice question must have exactly one answer',
              ),
            },
            duplicateAnswers: {
              summary: 'Duplicate answers are not allowed',
              value: getBadRequestDocExample(
                'Duplicate answers are not allowed',
              ),
            },
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'No translation was found for this question',
      content: {
        'application/json': {
          example: {
            statusCode: 404,
            message:
              'Unable to answer question. No translation was found for selected language.',
          },
        },
      },
    }),
    ApiConflictResponse({
      description:
        'User attempted to answer a question that was already answered',
      content: {
        'application/json': {
          example: {
            message: 'You already answered this question.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      },
    }),
  );
}
