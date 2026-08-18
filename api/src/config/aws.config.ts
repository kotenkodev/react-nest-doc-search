import { registerAs } from '@nestjs/config';

export interface AWSConfig {
  bucketName: string;
  region: string;
  sqsUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
  opensearch: {
    node: string;
    username: string;
    password: string;
  };
}

export const awsConfig = registerAs('aws', (): AWSConfig => ({
  bucketName: process.env.AWS_BUCKET_NAME ?? '',
  region: process.env.AWS_REGION ?? '',
  sqsUrl: process.env.AWS_SQS_QUEUE_URL ?? '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  opensearch: {
    node: process.env.OPENSEARCH_NODE ?? 'http://localhost:9200',
    username: process.env.OPENSEARCH_AUTH_USERNAME ?? '',
    password: process.env.OPENSEARCH_AUTH_PASSWORD ?? '',
  },
}));
