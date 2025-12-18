import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackOptionTranslationDto {
  @ApiProperty({
    example: 'en',
    description: 'Language code',
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    example: 'Excellent',
    description: 'Option label in selected language',
  })
  @IsString()
  @IsNotEmpty()
  label: string;
}
