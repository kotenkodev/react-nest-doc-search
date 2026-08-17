import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_BUCKET, S3_CLIENT } from './storage.contants';

export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new S3Client({
      region: configService.getOrThrow<string>('aws.region'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('aws.accessKeyId'),
        secretAccessKey: configService.getOrThrow<string>(
          'aws.secretAccessKey',
        ),
      },
    });
  },
};

export const s3BucketProvider: Provider = {
  provide: S3_BUCKET,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return configService.getOrThrow<string>('aws.bucketName');
  },
};
