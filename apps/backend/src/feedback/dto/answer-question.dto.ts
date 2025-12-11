import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description: 'Answers, passed as string array of answers',
    example: ['1'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers: string[];

  @ApiProperty({ description: 'Language code', example: 'fr' })
  @IsString()
  @IsNotEmpty()
  language: string;
}
