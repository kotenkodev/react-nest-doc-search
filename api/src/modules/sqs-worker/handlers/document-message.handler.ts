import { Injectable } from '@nestjs/common';
import { MessageHandler } from '../interfaces/message-handler.interface';
import { DocumentsRepository } from '../../documents/document.repository';
import { DocumentParserService } from '../../parser/document-parser.service';
import { DocumentSearchService } from '../../documents/services/document-search.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class DocumentMessageHandler implements MessageHandler {
  constructor(
    private readonly documentRepository: DocumentsRepository,
    private readonly parserService: DocumentParserService,
    private readonly documentSearch: DocumentSearchService,
    private readonly storage: StorageService,
  ) {}

  canHandle(type: string) {
    return type === 'DOCUMENT_UPLOADED';
  }

  async handle(payload: { documentId: string }) {}
}
