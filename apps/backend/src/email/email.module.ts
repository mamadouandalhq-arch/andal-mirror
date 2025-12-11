import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendModule } from 'nest-resend';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ResendModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        apiKey: config.get<string>('RESEND_API_SECRET')!,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
