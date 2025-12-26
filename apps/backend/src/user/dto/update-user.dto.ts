import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'email',
    example: 'john.smith@gmail.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'firstName',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'lastName',
    example: 'Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'avatarUrl',
    example: 'https://cdn.example.com/avatar.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'city',
    example: 'New York',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'street',
    example: 'Baker Street',
    required: false,
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({
    description: 'building',
    example: '25',
    required: false,
  })
  @IsString()
  @IsOptional()
  building?: string;

  @ApiProperty({
    description: 'apartment',
    example: '42',
    required: false,
  })
  @IsString()
  @IsOptional()
  apartment?: string;
}
