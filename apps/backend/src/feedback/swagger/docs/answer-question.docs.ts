import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
      summary: 'An endpoint to send or update an answer to a current question.',
      description: `
An endpoint to send an answer to a current question.

- Current question is provided by /feedback/state endpoint or by a previous response of /feedback/answer-question  
- If answers array is provided, the answer will be saved  
- If answers array is omitted, the question will be skipped and no points will be earned  
- If the question was already answered before, the previous answer will be **overwritten** with the new one  
- Returns updated feedback session state if OK  
- response.current_question contains the next question if feedback session is still in progress
      `,
    }),

    ApiExtraModels(FeedbackResultInAnswerSwaggerDto, BadRequestSwaggerDto),

    ApiOkResponse({
      description:
        'Question processed successfully. Depending on the session state, either returns the next question or the completed feedback result.',
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(FeedbackResultInAnswerSwaggerDto),
          },
          examples: {
            inProgress: {
              summary:
                'Answer saved or updated, feedback session still in progress',
              value: feedbackInProgressExample,
            },
            completed: {
              summary: 'Answer saved or updated, feedback session completed',
              value: feedBackCompletedExample,
            },
          },
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation errors while answering feedback questions',
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
            invalidAnswerOption: {
              summary: 'Provided answer is not in allowed options list',
              value: getBadRequestDocExample(
                'You provided invalid answer option key.',
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
      description:
        'Unable to answer question because some resource was not found',
      content: {
        'application/json': {
          examples: {
            noTranslationsForQuestion: {
              summary: 'No translations found for the current question',
              value: {
                statusCode: 404,
                message:
                  'Unable to answer question. No translation was found for selected language.',
              },
            },
            optionCouldNotBeFound: {
              summary: 'Option could not be found',
              value: {
                statusCode: 404,
                message: "Option with key 'option1' not found",
              },
            },
          },
        },
      },
    }),
  );
}
