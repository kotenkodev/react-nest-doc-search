import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const UPLOAD_TTL_SECONDS = 300;
const DOWNLOAD_TTL_SECONDS = 3600;

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucketName = configService.getOrThrow<string>('AWS_BUCKET_NAME');
  }

  async getPresignedPostUrl(key: string, mimeType: string, size: number) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
      ContentLength: size,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_TTL_SECONDS,
    });
  }

  async getDownloadUrl(key: string, userFilename?: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: userFilename
        ? `attachment; filename="${encodeURIComponent(userFilename)}"`
        : 'attachment',
    });
    return await getSignedUrl(this.client, command, {
      expiresIn: DOWNLOAD_TTL_SECONDS,
    });
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}
