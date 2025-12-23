import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRedemptionDto, GetRedemptionsQueryDto, RejectRedemptionDto } from './dto';
import { RedemptionStatus } from '@prisma/client';
import { POINTS_PER_DOLLAR } from './redemption.consts';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RedemptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createRedemption(userId: string, dto: CreateRedemptionDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Get user with current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has enough points
      if (user.pointsBalance < dto.pointsAmount) {
        throw new BadRequestException('Insufficient points balance');
      }

      // Calculate dollar amount
      const dollarAmount = new Decimal(dto.pointsAmount).div(POINTS_PER_DOLLAR);

      // Create redemption and deduct points in a transaction
      const redemption = await tx.redemption.create({
        data: {
          userId,
          pointsAmount: dto.pointsAmount,
          dollarAmount,
          paypalEmail: dto.paypalEmail,
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

      return redemption;
    });
  }

  async getUserRedemptions(userId: string) {
    return await this.prisma.redemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllRedemptions(query: GetRedemptionsQueryDto) {
    const where: any = {};

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

