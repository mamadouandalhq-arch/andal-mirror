import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies';
import { GoogleModule } from './google/google.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, TokenModule, GoogleModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
