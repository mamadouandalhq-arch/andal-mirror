import { TokenModule } from './token/token.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies';
import { GoogleModule } from './google/google.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule, TokenModule, GoogleModule, ForgotPasswordModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
