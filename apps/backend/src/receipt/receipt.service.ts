import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ulid } from 'ulid';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReceiptStatus } from '@prisma/client';

@Injectable()
export class ReceiptService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;
  private readonly logger = new Logger('ReceiptService');

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucketRegion = configService.get<string>('AWS_REGION')!;

    this.s3 = new S3Client({
      region: this.bucketRegion,
      credentials: {
        accessKeyId: configService.get<string>('AWS_S3_ACCESS_KEY')!,
        secretAccessKey: configService.get<string>('AWS_S3_SECRET_KEY')!,
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
  }

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
    return this.prisma.receipt.findMany({
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
    return this.prisma.receipt.findFirst({ where });
  }

  async getMany(where: Prisma.ReceiptWhereInput) {
    return this.prisma.receipt.findMany({ where });
  }

  private async upload(userId: string, file: Express.Multer.File) {
    const fileName = `${userId}-${ulid()}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
      await this.s3.send(command);

      return `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${fileName}`;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Failed to upload file. Please, try again later.',
      );
    }
  }
}
