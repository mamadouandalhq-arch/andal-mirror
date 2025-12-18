import { InternalServerErrorException, Logger, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { UploadFileDto } from './dto';

@Module({
  providers: [StorageService],
})
export class StorageModule {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;
  private readonly logger = new Logger('StorageService');

  constructor(private readonly configService: ConfigService) {
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

  async uploadFile({ fileName, file }: UploadFileDto) {
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
