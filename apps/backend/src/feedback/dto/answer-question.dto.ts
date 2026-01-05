import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description:
      'Array of selected option keys for the current question. Each value must be a valid option key (for example "option1"), not a label. If the field is omitted, the question will be skipped. If the array is provided but empty, it is treated as an attempt to answer the question.',
    example: ['option1'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answerKeys?: string[];

  @ApiProperty({
    description:
      'Text answer for text-type questions. Max 280 characters (enforced on frontend).',
    example: 'My comment here...',
    required: false,
  })
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiProperty({ description: 'Language code', example: 'fr' })
  @IsString()
  @IsNotEmpty()
  language: string;
}
