import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReceiptStatus } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { ulid } from 'ulid';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getOneOrThrow(receiptId: string, userId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
        userId: userId,
      },
      include: this.getReceiptFeedbackResultInclude(),
    });

    if (!receipt) {
      throw new NotFoundException('Receipt could not be found');
    }

    return receipt;
  }

  async getAll(userId: string) {
    return await this.prisma.receipt.findMany({
      where: {
        userId,
      },
      include: this.getReceiptFeedbackResultInclude(),
    });
  }

  async saveAndUpload(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing in the request');
    }

    const currentAwaitingFeedbackReceipts = await this.getMany({
      userId: userId,
      status: ReceiptStatus.awaitingFeedback,
    });

    const currentPendingReceipts = await this.getMany({
      userId: userId,
      status: ReceiptStatus.pending,
    });

    if (
      currentAwaitingFeedbackReceipts.length > 0 ||
      currentPendingReceipts.length > 0
    ) {
      throw new BadRequestException(
        "You already have a receipt awaiting feedback or pending! You can't create more than one receipt in progress.",
      );
    }

    const url = await this.storageService.uploadFile({
      fileName: `receipts/${userId}-${ulid()}`,
      file,
    });

    await this.prisma.receipt.create({
      data: {
        receiptUrl: url,
        userId: userId,
        status: ReceiptStatus.awaitingFeedback,
      },
    });

    return { url };
  }

  async getFirst(where: Prisma.ReceiptWhereInput) {
    return await this.prisma.receipt.findFirst({ where });
  }

  async getMany(where: Prisma.ReceiptWhereInput) {
    return await this.prisma.receipt.findMany({ where });
  }

  async updateReceiptFile(
    receiptId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is missing in the request');
    }

    // Get receipt and verify ownership
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt could not be found');
    }

    if (receipt.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this receipt',
      );
    }

    // Verify receipt status is awaitingFeedback (before feedback completion)
    if (receipt.status !== ReceiptStatus.awaitingFeedback) {
      throw new BadRequestException(
        'Receipt can only be updated before feedback is completed',
      );
    }

    // Upload new file
    const newUrl = await this.storageService.uploadFile({
      fileName: `receipts/${userId}-${ulid()}`,
      file,
    });

    // Delete old file (non-blocking)
    if (receipt.receiptUrl) {
      await this.storageService.deleteFile(receipt.receiptUrl);
    }

    // Update receipt URL in database
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { receiptUrl: newUrl },
    });

    return { url: newUrl };
  }

  private getReceiptFeedbackResultInclude() {
    return {
      feedbackResult: {
        select: {
          id: true,
          status: true,
          pointsValue: true,
          completedAt: true,
        },
      },
    };
  }
}
