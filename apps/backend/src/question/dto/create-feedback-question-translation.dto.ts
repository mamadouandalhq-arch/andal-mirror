import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackQuestionTranslationDto {
  @ApiProperty({
    example: 'en',
    description: 'Language code',
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: 'How would you rate your apartment condition?',
    description: 'Question text in selected language',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
