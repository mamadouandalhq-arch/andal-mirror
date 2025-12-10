import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyForgotPasswordTokenDto {
  @ApiProperty({ description: 'Forgot Password token in raw format' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Token id from email' })
  @IsString()
  tokenId: string;
}
