import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordDto, VerifyForgotPasswordTokenDto } from './dto';
import { ForgotPasswordDocs, VerifyTokenDocs } from './docs';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @VerifyTokenDocs()
  @Post('verify-token')
  async verifyToken(@Body() dto: VerifyForgotPasswordTokenDto) {
    const isValid = await this.forgotPasswordService.verifyToken(dto);
    return { success: isValid };
  }

  @ForgotPasswordDocs()
  @Post()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.forgotPasswordService.forgotPassword(dto);

    return { success: result };
  }
}
