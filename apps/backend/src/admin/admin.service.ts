import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReceiptsQueryDto, ReviewReceiptDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async reviewReceipt(dto: ReviewReceiptDto) {
    try {
      return await this.prisma.receipt.update({
        where: {
          id: dto.receiptId,
        },
        data: {
          status: dto.status,
        },
      });
    } catch (err: unknown) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('Receipt not found');
        }
      }

      throw err;
    }
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
      },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt with id '${receiptId}' not found`);
    }

    return receipt;
  }
}
