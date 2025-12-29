import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeedbackOptionTranslationDto } from './create-feedback-option-translation.dto';
import { feedbackQuestionOptionTranslationExampleConst } from '../swagger';

export class CreateFeedbackOptionDto {
  @ApiProperty({
    example: 'option1',
    description: 'Stable option key used in answers',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Order of option inside the question',
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({
    example: 0,
    minimum: 0,
    description:
      'Score for this option (0 to n-1 where n is the number of options)',
  })
  @IsInt()
  @Min(0)
  score: number;

  @ApiProperty({
    type: [CreateFeedbackOptionTranslationDto],
    description: 'Localized labels for the option',
    example: feedbackQuestionOptionTranslationExampleConst,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackOptionTranslationDto)
  translations: CreateFeedbackOptionTranslationDto[];
}
