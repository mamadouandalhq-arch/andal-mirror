import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import 'dotenv/config';
import { TokenModule } from './auth/token/token.module';
import { GoogleModule } from './auth/google/google.module';
import { validationSchema } from './common';
import { ReceiptModule } from './receipt/receipt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    TokenModule,
    GoogleModule,
    ReceiptModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
