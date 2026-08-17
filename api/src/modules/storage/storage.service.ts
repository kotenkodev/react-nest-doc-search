import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_BUCKET, S3_CLIENT } from './storage.contants';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const UPLOAD_TTL_SECONDS = 300;
const DOWNLOAD_TTL_SECONDS = 3600;

@Injectable()
export class StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    @Inject(S3_BUCKET) private readonly bucketName: string,
  ) {}

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

  async getObjectMetadata(
    key: string,
  ): Promise<{ size?: number; mimeType?: string }> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.client.send(command);
    return {
      size: response.ContentLength,
      mimeType: response.ContentType,
    };
  }

  async getObjectStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.client.send(command);
    return response.Body as Readable;
  }

  async downloadToTempFile(key: string): Promise<string> {
    const stream = await this.getObjectStream(key);
    const tempFilePath = join(tmpdir(), `doc-${randomUUID()}.tmp`);
    await pipeline(stream, createWriteStream(tempFilePath));
    return tempFilePath;
  }

  async withTempFile<T>(
    key: string,
    callback: (filePath: string) => Promise<T>,
  ): Promise<T> {
    const tempPath = await this.downloadToTempFile(key);
    try {
      return await callback(tempPath);
    } finally {
      await unlink(tempPath).catch(() => {});
    }
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}
