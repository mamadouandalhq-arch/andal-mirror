import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyForgotPasswordTokenDto {
  @ApiProperty({ description: 'Forgot Password token in raw format' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Token id from email' })
  @IsString()
  @IsNotEmpty()
  tokenId: string;
}
