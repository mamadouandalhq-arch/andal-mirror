import { Module } from '@nestjs/common';
import { ForgotPasswordController } from './forgot-password.controller';
import { ForgotPasswordService } from './forgot-password.service';
import { UserModule } from '../../user/user.module';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [UserModule, EmailModule],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
