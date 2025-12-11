import { Injectable } from '@nestjs/common';
import { SendForgotPasswordEmailDto } from './dto';
import { InjectResend } from 'nest-resend';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    @InjectResend() private readonly resendClient: Resend,
    private readonly configService: ConfigService,
  ) {}

  async sendForgotPassword(dto: SendForgotPasswordEmailDto) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
    const forgotPasswordPath = this.configService.get<string>(
      'FRONTEND_FORGOT_PASSWORD_PATH',
    )!;

    const forgotPasswordLink = `${frontendUrl}${forgotPasswordPath}?token=${dto.token}&tokenId=${dto.tokenId}`;

    return this.resendClient.emails.send({
      to: dto.email,
      subject: 'Forgot password link',
      template: {
        id: 'forgot-password',
        variables: {
          FORGOT_PASSWORD_LINK: forgotPasswordLink,
        },
      },
    });
  }
}
