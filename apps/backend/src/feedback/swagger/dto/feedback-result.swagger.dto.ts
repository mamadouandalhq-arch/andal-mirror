import { ApiProperty } from '@nestjs/swagger';
import { FeedbackQuestionSwaggerDto } from './feedback-question.swagger.dto';

export class FeedbackResultSwaggerDto {
  @ApiProperty({
    description: 'Current state of the feedback session.',
    enum: ['inProgress', 'notStarted', 'unavailable', 'completed'],
  })
  status!: string;

  @ApiProperty({ type: Number, required: false })
  totalQuestions?: number;

  @ApiProperty({ type: Number, required: false })
  earnedCents?: number;

  @ApiProperty({ type: Number, required: false })
  answeredQuestions?: number;

  @ApiProperty({
    type: FeedbackQuestionSwaggerDto,
    required: false,
    nullable: true,
  })
  currentQuestion?: FeedbackQuestionSwaggerDto;

  @ApiProperty({ type: String, required: false })
  reason?: string;
}
