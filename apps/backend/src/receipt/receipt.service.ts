import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReceiptStatus } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

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
    });
  }

  async saveAndUpload(userId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing in the request');
    }

    const currentPendingReceipts = await this.getMany({
      userId: userId,
      status: ReceiptStatus.pending,
    });

    if (currentPendingReceipts.length > 0) {
      throw new BadRequestException(
        "You already have pending receipt! You can't create more than one pending receipt.",
      );
    }

    const url = await this.upload(userId, file);

    await this.prisma.receipt.create({
      data: {
        receiptUrl: url,
        userId: userId,
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

  private async upload(userId: string, file: Express.Multer.File) {}
}
