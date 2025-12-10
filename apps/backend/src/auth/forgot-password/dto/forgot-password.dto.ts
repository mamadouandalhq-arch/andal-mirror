import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'User email', example: 'john.smith@gmail.com' })
  @IsEmail()
  @IsString()
  email: string;
}
