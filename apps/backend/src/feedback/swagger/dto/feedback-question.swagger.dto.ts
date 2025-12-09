import { FeedbackQuestionDto } from '@shared/feedback';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackQuestionSwaggerDto extends FeedbackQuestionDto {
  @ApiProperty({
    example: '56f51aa5-5cd3-443d-a99a-6ba9cb93a513',
    description: 'UUID',
  })
  declare id: string;

  @ApiProperty({ example: 1 })
  declare serial_number: number;

  @ApiProperty({ example: '...' })
  declare text: string;

  @ApiProperty({ enum: ['single', 'multiple'] })
  declare type: 'single' | 'multiple';

  @ApiProperty({ type: [String], example: ['1', '2', '3'] })
  declare options: string[];

  @ApiProperty({ format: 'date-time', example: '2025-12-05T10:41:37.290Z' })
  declare created_at: Date;
}
