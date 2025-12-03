import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [UserModule, TokenModule, GoogleModule],
  providers: [JwtStrategy],
})
export class AuthModule {}
