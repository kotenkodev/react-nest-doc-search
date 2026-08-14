import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';
import { DocumentsRepository } from './document.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [StorageModule, SearchModule, DatabaseModule],
  providers: [DocumentsService, DocumentsRepository],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
