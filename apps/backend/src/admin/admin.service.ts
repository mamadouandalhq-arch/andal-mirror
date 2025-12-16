import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReceiptsQueryDto, ReviewReceiptDto } from './dto';
import { ReceiptStatus } from '@prisma/client';
import { mapFeedbackAnswers } from './mappers';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedbackById(feedbackId: string, language: string) {
    const feedbackResult = await this.prisma.feedbackResult.findUnique({
      where: {
        id: feedbackId,
      },
      include: this.getFeedbackWithAnswersInclude(language),
    });

    if (!feedbackResult) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      id: feedbackResult.id,
      status: feedbackResult.status,
      pointsValue: feedbackResult.pointsValue,
      createdAt: feedbackResult.createdAt,
      completedAt: feedbackResult.completedAt,
      answers: mapFeedbackAnswers(feedbackResult.answers),
    };
  }

  async reviewReceipt(dto: ReviewReceiptDto) {
    return await this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: dto.receiptId },
        select: {
          id: true,
          status: true,
          userId: true,
          feedbackResult: {
            select: { pointsValue: true },
          },
        },
      });

      if (!receipt) {
        throw new NotFoundException('Receipt not found');
      }

      if (!receipt.userId) {
        throw new NotFoundException('User not found');
      }

      const wasPending = receipt.status === ReceiptStatus.pending;
      const willBeApproved = dto.status === ReceiptStatus.approved;

      if (!wasPending) {
        throw new BadRequestException('Receipt was already handled');
      }

      const updatedReceipt = await tx.receipt.update({
        where: { id: receipt.id },
        data: { status: dto.status },
      });

      if (wasPending && willBeApproved) {
        await tx.user.update({
          where: { id: receipt.userId },
          data: {
            pointsBalance: {
              increment: receipt.feedbackResult?.pointsValue ?? 0,
            },
          },
        });
      }

      return updatedReceipt;
    });
  }

  async getReceipts(query: GetReceiptsQueryDto) {
    return await this.prisma.receipt.findMany({
      where: {
        feedbackResult: {
          status: query.feedbackStatus,
        },
        status: query.status,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getReceipt(receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
      },
      include: {
        feedbackResult: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with id '${receiptId}' not found`);
    }

    return receipt;
  }

  private getFeedbackWithAnswersInclude(language: string) {
    return {
      answers: {
        include: {
          question: {
            include: {
              translations: {
                where: { language: language },
                take: 1,
              },
              options: {
                include: {
                  translations: {
                    where: { language: language },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
