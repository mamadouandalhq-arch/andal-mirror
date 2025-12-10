import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto } from '../dto';
import { ForgotPasswordService } from './forgot-password.service';

@Controller('auth/forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordService.forgotPassword(dto);
  }
}
