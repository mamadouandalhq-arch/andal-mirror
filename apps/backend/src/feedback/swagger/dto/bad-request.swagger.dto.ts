import { ApiProperty } from '@nestjs/swagger';

export class BadRequestSwaggerDto {
  @ApiProperty({ example: 'Some error message' })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}
