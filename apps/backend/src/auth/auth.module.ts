import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies';

@Module({
  imports: [UserModule, TokenModule],
  providers: [JwtStrategy],
})
export class AuthModule {}
