import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRedemptionDto,
  GetRedemptionsQueryDto,
  PaymentMethod,
  RejectRedemptionDto,
} from './dto';
import { RedemptionStatus } from '@prisma/client';
import { POINTS_PER_DOLLAR } from './redemption.consts';
import { Decimal } from '@prisma/client/runtime/library';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async createRedemption(userId: string, dto: CreateRedemptionDto) {
    const redemption = await this.prisma.$transaction(async (tx) => {
      // Get user with current balance and profile data
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          pointsBalance: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has enough points
      if (user.pointsBalance < dto.pointsAmount) {
        throw new BadRequestException('Insufficient points balance');
      }

      // Determine payment details based on payment method
      let paymentEmail: string | null = null;
      let paymentPhone: string | null = null;

      if (dto.paymentMethod === PaymentMethod.EMAIL) {
        // Use provided email or default to user's email
        paymentEmail = dto.paymentEmail || user.email;
        if (!paymentEmail) {
          throw new BadRequestException(
            'Payment email is required when payment method is email',
          );
        }
      } else if (dto.paymentMethod === PaymentMethod.PHONE) {
        // Use provided phone or default to user's phone
        paymentPhone = dto.paymentPhone || user.phoneNumber || null;
        if (!paymentPhone) {
          throw new BadRequestException(
            'Payment phone is required when payment method is phone. Please add a phone number to your profile first.',
          );
        }
      }

      // Calculate dollar amount
      const dollarAmount = new Decimal(dto.pointsAmount).div(POINTS_PER_DOLLAR);

      // Create redemption and deduct points in a transaction
      const redemption = await tx.redemption.create({
        data: {
          userId,
          pointsAmount: dto.pointsAmount,
          dollarAmount,
          paymentMethod: dto.paymentMethod,
          paymentEmail: paymentEmail ?? null,
          paymentPhone: paymentPhone ?? null,
          status: RedemptionStatus.pending,
        },
      });

      // Deduct points from user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: {
            decrement: dto.pointsAmount,
          },
        },
      });

      return { redemption, user };
    });

    // Send email notification to admin
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL')!;
      const userName = `${redemption.user.firstName} ${redemption.user.lastName}`;

      await this.emailService.sendWithdrawalNotification({
        adminEmail,
        userName,
        userEmail: redemption.user.email,
        pointsAmount: redemption.redemption.pointsAmount,
        dollarAmount: redemption.redemption.dollarAmount.toString(),
        paymentMethod: redemption.redemption.paymentMethod,
        paymentEmail: redemption.redemption.paymentEmail,
        paymentPhone: redemption.redemption.paymentPhone,
        redemptionId: redemption.redemption.id,
      });
    } catch (error) {
      // Log error but don't fail the redemption creation if email fails
      console.error('Failed to send withdrawal notification email:', error);
    }

    return redemption.redemption;
  }

  async getUserRedemptions(userId: string) {
    return await this.prisma.redemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllRedemptions(query: GetRedemptionsQueryDto) {
    const where: {
      status?: RedemptionStatus;
      userId?: string;
    } = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    return await this.prisma.redemption.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRedemptionById(redemptionId: string) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    return redemption;
  }

  async approveRedemption(redemptionId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new NotFoundException('Redemption not found');
      }

      if (redemption.status !== RedemptionStatus.pending) {
        throw new BadRequestException(
          'Redemption can only be approved from pending status',
        );
      }

      return await tx.redemption.update({
        where: { id: redemptionId },
        data: {
          status: RedemptionStatus.approved,
          approvedAt: new Date(),
        },
      });
    });
  }

  async completeRedemption(redemptionId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new NotFoundException('Redemption not found');
      }

      if (redemption.status !== RedemptionStatus.approved) {
        throw new BadRequestException(
          'Redemption can only be completed from approved status',
        );
      }

      return await tx.redemption.update({
        where: { id: redemptionId },
        data: {
          status: RedemptionStatus.completed,
          completedAt: new Date(),
        },
      });
    });
  }

  async rejectRedemption(redemptionId: string, dto: RejectRedemptionDto) {
    return await this.prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new NotFoundException('Redemption not found');
      }

      if (
        redemption.status !== RedemptionStatus.pending &&
        redemption.status !== RedemptionStatus.approved
      ) {
        throw new BadRequestException(
          'Redemption can only be rejected from pending or approved status',
        );
      }

      // Update redemption status
      const updatedRedemption = await tx.redemption.update({
        where: { id: redemptionId },
        data: {
          status: RedemptionStatus.rejected,
          rejectedAt: new Date(),
          rejectionReason: dto.rejectionReason,
        },
      });

      // Return points to user
      await tx.user.update({
        where: { id: redemption.userId },
        data: {
          pointsBalance: {
            increment: redemption.pointsAmount,
          },
        },
      });

      return updatedRedemption;
    });
  }
}
