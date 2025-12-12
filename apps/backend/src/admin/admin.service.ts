import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReceiptsQueryDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getReceipts(query: GetReceiptsQueryDto) {
    return this.prisma.receipt.findMany({
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
