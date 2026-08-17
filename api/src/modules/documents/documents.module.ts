import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageModule } from '../storage/storage.module';
import { SearchModule } from '../search/search.module';
import { DocumentsRepository } from './document.repository';
import { DatabaseModule } from '../database/database.module';
import { DocumentSearchService } from './services/document-search.service';

@Module({
  imports: [StorageModule, SearchModule, DatabaseModule],
  providers: [DocumentsService, DocumentsRepository, DocumentSearchService],
  controllers: [DocumentsController],
  exports: [DocumentsRepository, DocumentSearchService],
})
export class DocumentsModule {}
