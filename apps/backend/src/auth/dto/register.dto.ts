import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'email', example: 'john.smith@gmail.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ description: 'firstName', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'lastName', example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'password',
    example: 'super-secret-password',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
