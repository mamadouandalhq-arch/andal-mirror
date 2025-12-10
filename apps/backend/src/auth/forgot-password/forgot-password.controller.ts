import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto, VerifyForgotPasswordTokenDto } from '../dto';
import { ForgotPasswordService } from './forgot-password.service';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post('verify-token')
  async verifyToken(@Body() dto: VerifyForgotPasswordTokenDto) {
    const isValid = await this.forgotPasswordService.verifyToken(dto);
    return { success: isValid };
  }

  @Post()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.forgotPasswordService.forgotPassword(dto);

    return { success: result };
  }
}
