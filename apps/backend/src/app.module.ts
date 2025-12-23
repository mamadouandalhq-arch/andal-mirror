import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import 'dotenv/config';
import { TokenModule } from './auth/token/token.module';
import { GoogleModule } from './auth/google/google.module';
import { validationSchema } from './common';
import { ReceiptModule } from './receipt/receipt.module';
import { FeedbackModule } from './feedback/feedback.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { QuestionModule } from './question/question.module';
import { SurveyModule } from './survey/survey.module';
import { RedemptionModule } from './redemption/redemption.module';

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
    FeedbackModule,
    EmailModule,
    AdminModule,
    StorageModule,
    QuestionModule,
    SurveyModule,
    RedemptionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
