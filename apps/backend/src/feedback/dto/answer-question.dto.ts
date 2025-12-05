import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AnswerQuestionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers: string[];
}
