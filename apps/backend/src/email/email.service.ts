import { Injectable } from '@nestjs/common';
import {
  SendForgotPasswordEmailDto,
  SendWelcomeEmailDto,
  SendWithdrawalNotificationDto,
} from './dto';
import { InjectResend } from 'nest-resend';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    @InjectResend() private readonly resendClient: Resend,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(dto: SendWelcomeEmailDto) {
    return await this.resendClient.emails.send({
      to: dto.email,
      template: {
        id: 'welcome-email',
        variables: {
          USER_FIRST_NAME: dto.firstName,
        },
      },
    });
  }

  async sendForgotPassword(dto: SendForgotPasswordEmailDto) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
    const forgotPasswordPath = this.configService.get<string>(
      'FRONTEND_FORGOT_PASSWORD_PATH',
    )!;

    const forgotPasswordLink = `${frontendUrl}${forgotPasswordPath}?token=${dto.token}&tokenId=${dto.tokenId}`;

    return await this.resendClient.emails.send({
      to: dto.email,
      template: {
        id: 'forgot-password',
        variables: {
          FORGOT_PASSWORD_LINK: forgotPasswordLink,
        },
      },
    });
  }

  async sendWithdrawalNotification(dto: SendWithdrawalNotificationDto) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
    const adminRedemptionsPath = '/admin/redemptions';

    const redemptionLink = `${frontendUrl}${adminRedemptionsPath}/${dto.redemptionId}`;

    // Format payment contact info based on payment method
    const paymentContact =
      dto.paymentMethod === 'email'
        ? dto.paymentEmail || 'N/A'
        : dto.paymentPhone || 'N/A';

    return await this.resendClient.emails.send({
      to: dto.adminEmail,
      template: {
        id: 'withdrawal-request',
        variables: {
          USER_NAME: dto.userName,
          USER_EMAIL: dto.userEmail,
          REDEMPTION_ID: dto.redemptionId,
          POINTS_AMOUNT: dto.pointsAmount.toString(),
          DOLLAR_AMOUNT: dto.dollarAmount,
          PAYMENT_METHOD: dto.paymentMethod === 'email' ? 'Email' : 'Phone',
          PAYMENT_CONTACT: paymentContact,
          REDEMPTION_LINK: redemptionLink,
        },
      },
    });
  }
}
