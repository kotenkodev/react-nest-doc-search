import { Module } from '@nestjs/common';
import { SqsWorkerService } from './sqs-worker.service';
import { SqsModule } from '../sqs/sqs.module';
import { DocumentsModule } from '../documents/documents.module';
import { StorageModule } from '../storage/storage.module';
import { ParserModule } from '../parser/parser.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [SqsModule, DocumentsModule, StorageModule, ParserModule, SseModule],
  providers: [SqsWorkerService],
  exports: [SqsWorkerService],
})
export class SqsWorkerModule {}
