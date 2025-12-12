import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnBackDto {
  @ApiProperty({ description: 'Language code', example: 'en' })
  @IsNotEmpty()
  @IsString()
  language: string;
}
