import { FeedbackOptionDto, FeedbackQuestionDto } from '@shared/feedback';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackQuestionSwaggerDto extends FeedbackQuestionDto {
  @ApiProperty({
    example: '56f51aa5-5cd3-443d-a99a-6ba9cb93a513',
    description: 'UUID',
  })
  declare id: string;

  @ApiProperty({ example: 1 })
  declare serialNumber: number;

  @ApiProperty({ example: '...' })
  declare text: string;

  @ApiProperty({ enum: ['single', 'multiple', 'text'] })
  declare type: 'single' | 'multiple' | 'text';

  @ApiProperty({ type: [String], example: ['1', '2', '3'] })
  declare options: FeedbackOptionDto[];

  @ApiProperty({ type: [String], required: false, example: ['option1'] })
  declare currentAnswerKeys?: string[];

  @ApiProperty({
    type: String,
    required: false,
    example: 'My answer text...',
    maxLength: 280,
  })
  declare currentAnswerText?: string;
}
