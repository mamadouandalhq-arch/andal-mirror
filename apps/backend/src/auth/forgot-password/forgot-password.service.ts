import { Injectable } from '@nestjs/common';
import { ForgotPasswordDto } from '../dto';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import argon from 'argon2';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.getOneByEmail(dto.email);

    const successMessage = { success: true };

    if (!user) {
      return successMessage;
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const hashedToken = await argon.hash(token);

    const MINUTES_TOKEN_TO_LIVE = 60;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + MINUTES_TOKEN_TO_LIVE);

    await this.prisma.forgotPasswordToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await this.prisma.forgotPasswordToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    //   TODO: SEND email to dto.email

    return successMessage;
  }
}
