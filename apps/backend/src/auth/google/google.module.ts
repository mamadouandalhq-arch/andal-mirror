import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { UserModule } from '../../user/user.module';
import { TokenModule } from '../token/token.module';
import { GoogleStrategy } from './strategies';

@Module({
  imports: [UserModule, TokenModule],
  controllers: [GoogleController],
  providers: [GoogleService, GoogleStrategy],
})
export class GoogleModule {}
