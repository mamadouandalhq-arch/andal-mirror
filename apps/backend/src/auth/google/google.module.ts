import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { UserModule } from '../../user/user.module';
import { TokenModule } from '../token/token.module';
import { GoogleStrategy } from './strategies';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [UserModule, TokenModule, EmailModule],
  controllers: [GoogleController],
  providers: [GoogleService, GoogleStrategy],
})
export class GoogleModule {}
