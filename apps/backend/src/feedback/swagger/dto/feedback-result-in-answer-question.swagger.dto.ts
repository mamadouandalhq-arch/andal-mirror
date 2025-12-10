import { FeedbackResultSwaggerDto } from './feedback-result.swagger.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResultInAnswerSwaggerDto extends FeedbackResultSwaggerDto {
  @ApiProperty({
    description: 'Current feedback session status after answering a question.',
    enum: ['inProgress', 'completed'],
    example: 'inProgress',
  })
  declare status: 'inProgress' | 'completed';
}
