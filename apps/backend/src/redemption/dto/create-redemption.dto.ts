import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  EMAIL = 'email',
  PHONE = 'phone',
}

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
    description: 'Payment method: email or phone',
    example: 'email',
    enum: PaymentMethod,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Email address for payment (required if paymentMethod is email)',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.EMAIL)
  @IsNotEmpty()
  @IsEmail()
  paymentEmail?: string;

  @ApiProperty({
    description: 'Phone number for payment in Canadian format (required if paymentMethod is phone)',
    example: '+14161234567',
    required: false,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.PHONE)
  @IsNotEmpty()
  @Matches(/^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/, {
    message: 'Phone number must be in Canadian format (+1XXXXXXXXXX)',
  })
  paymentPhone?: string;
}
