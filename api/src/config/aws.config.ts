import { registerAs } from '@nestjs/config';

export interface AWSConfig {
  bucketName: string;
  region: string;
  sqsUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const awsConfig = registerAs('aws', (): AWSConfig => ({
  bucketName: process.env.AWS_BUCKET_NAME ?? '',
  region: process.env.AWS_REGION ?? '',
  sqsUrl: process.env.AWS_SQS_URL ?? '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
}));
