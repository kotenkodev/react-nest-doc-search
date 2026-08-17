import { Module } from '@nestjs/common';
import { SqsWorkerService } from './sqs-worker.service';
import { SqsModule } from '../sqs/sqs.module';
import { DocumentsModule } from '../documents/documents.module';
import { SearchModule } from '../search/search.module';
import { StorageModule } from '../storage/storage.module';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [
    SqsModule,
    DocumentsModule,
    SearchModule,
    StorageModule,
    ParserModule,
  ],
  providers: [SqsWorkerService],
  exports: [SqsWorkerService],
})
export class SqsWorkerModule {}
