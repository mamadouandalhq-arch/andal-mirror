import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto, VerifyForgotPasswordTokenDto } from '../dto';
import { ForgotPasswordService } from './forgot-password.service';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post('verify-token')
  verifyToken(@Body() dto: VerifyForgotPasswordTokenDto) {
    return this.forgotPasswordService.verifyToken(dto);
  }

  @Post()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordService.forgotPassword(dto);
  }
}
