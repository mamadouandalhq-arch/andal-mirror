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
      'Answers, passed as string array of answers. If answers array is not passed, question will be skipped. If answers array is empty, it counts as an attempt to answer a question.',
    example: ['1'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answerKeys?: string[];

  @ApiProperty({ description: 'Language code', example: 'fr' })
  @IsString()
  @IsNotEmpty()
  language: string;
}
