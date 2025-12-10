import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New user password',
    example: 'new-super-secret-password',
    minLength: 8,
    maxLength: 20,
  })
  @MinLength(8)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Forgot Password token in raw format' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Token id from email' })
  @IsString()
  @IsNotEmpty()
  tokenId: string;
}
