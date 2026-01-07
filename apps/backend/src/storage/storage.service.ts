import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { UploadFileDto } from './dto';
import { mimeToExt } from './utils';

@Injectable()
export class StorageService {
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
    const fileNameWithExt = `${fileName}.${mimeToExt(file.mimetype)}`;
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fileNameWithExt,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
      await this.s3.send(command);

      return `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${fileNameWithExt}`;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Failed to upload file. Please, try again later.',
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the S3 URL
      // URL format: https://bucket-name.s3.region.amazonaws.com/key
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);
    } catch (err) {
      // Log error but don't throw - file might already be deleted or not exist
      // This prevents blocking receipt updates if old file deletion fails
      this.logger.warn(`Failed to delete file ${fileUrl}:`, err);
    }
  }
}
