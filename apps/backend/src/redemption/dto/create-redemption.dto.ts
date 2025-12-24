import { IsEmail, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRedemptionDto {
  @ApiProperty({
    description: 'Amount of points to redeem',
    example: 1000,
    minimum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(100)
  pointsAmount: number;

  @ApiProperty({
    description: 'Email address for payment',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  paymentEmail: string;
}

