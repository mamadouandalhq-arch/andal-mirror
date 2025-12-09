import { FeedbackResultSwaggerDto } from './feedback-result.swagger.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResultInAnswerSwaggerDto extends FeedbackResultSwaggerDto {
  @ApiProperty({
    description: 'Current feedback session status after answering a question.',
    enum: ['in_progress', 'completed'],
    example: 'in_progress',
  })
  declare status: 'in_progress' | 'completed';
}
