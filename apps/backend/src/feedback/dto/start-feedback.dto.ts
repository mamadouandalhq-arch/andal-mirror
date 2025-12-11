import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartFeedbackDto {
  @ApiProperty({ description: 'Language code', example: 'en' })
  @IsString()
  language: string;
}
