import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3_CLIENT } from './storage.contants';
import { S3Client } from '@aws-sdk/client-s3';
import { s3BucketProvider, s3ClientProvider } from './storage.provider';

@Module({
  providers: [s3ClientProvider, s3BucketProvider, StorageService],
  exports: [StorageService],
})
export class StorageModule implements OnModuleDestroy {
  constructor(@Inject(S3_CLIENT) private readonly client: S3Client) {}

  onModuleDestroy(): void {
    this.client.destroy();
  }
}
