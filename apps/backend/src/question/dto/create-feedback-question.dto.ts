import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FeedbackType } from '@prisma/client';
import { CreateFeedbackQuestionTranslationDto } from './create-feedback-question-translation.dto';
import { CreateFeedbackOptionDto } from './create-feedback-option.dto';
import {
  feedbackQuestionOptionsExamplesConst,
  feedbackQuestionTextsExamplesConst,
} from '../swagger';

export class CreateFeedbackQuestionDto {
  @ApiProperty({
    enum: FeedbackType,
    example: FeedbackType.single,
    description: 'Question type',
  })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({
    type: [CreateFeedbackQuestionTranslationDto],
    description: 'Localized question texts',
    example: feedbackQuestionTextsExamplesConst,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionTranslationDto)
  translations: CreateFeedbackQuestionTranslationDto[];

  @ApiProperty({
    type: [CreateFeedbackOptionDto],
    description: 'Answer options for the question',
    example: feedbackQuestionOptionsExamplesConst,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackOptionDto)
  options: CreateFeedbackOptionDto[];
}
