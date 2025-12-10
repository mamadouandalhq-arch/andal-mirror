import { Injectable, NotFoundException } from '@nestjs/common';
import { ForgotPasswordDto, VerifyForgotPasswordTokenDto } from '../dto';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async verifyToken({ token, tokenId }: VerifyForgotPasswordTokenDto) {
    const tokenInDb = await this.findTokenById(tokenId);

    if (!tokenInDb) {
      return false;
    }

    const isValidToken = await argon.verify(tokenInDb.token, token);

    const isExpired = tokenInDb.expiresAt < new Date();

    return !(isExpired || !isValidToken);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.getUniqueByEmail(dto.email);

    if (!user) {
      return true;
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

    console.log({ token });

    //   TODO: SEND email to dto.email
    // example: https://localhost:3001/forgot-password?token=long-string&tokenId=ch72gsb320000udocl363eofy

    return true;
  }

  async deleteTokenByIdOrThrow(tokenId: string) {
    try {
      return this.prisma.forgotPasswordToken.delete({
        where: {
          id: tokenId,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('Forgot password token not found');
        }
      }

      throw err;
    }
  }

  findTokenById(tokenId: string) {
    return this.prisma.forgotPasswordToken.findUnique({
      where: {
        id: tokenId,
      },
    });
  }
}
