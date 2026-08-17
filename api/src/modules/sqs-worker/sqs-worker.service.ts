import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { SqsService } from '../sqs/sqs.service';
import { DocumentsRepository } from '../documents/document.repository';
import { DocumentParserService } from '../parser/document-parser.service';
import { DocumentSearchService } from '../documents/services/document-search.service';
import { DocumentStatus } from '../database/schema';

@Injectable()
export class SqsWorkerService {
  private readonly logger = new Logger(SqsWorkerService.name);

  constructor(
    private readonly sqsService: SqsService,
    private readonly documentRepository: DocumentsRepository,
    private readonly documentParserService: DocumentParserService,
    private readonly documentSearchService: DocumentSearchService,
    private readonly storage: StorageService,
  ) {}

  async processDocumentMessage(documentId: string) {
    try {
      const document =
        await this.documentRepository.getDocumentById(documentId);

      if (!document) {
        throw new Error(`Document with ID ${documentId} not found`);
      }

      if (document.status === DocumentStatus.SUCCESS) {
        this.logger.warn(
          `Document ${document.id} already processed. Skipping.`,
        );
        return;
      }

      const metadata = await this.storage.getObjectMetadata(
        document.storageFilename,
      );

      if (metadata.size !== undefined && metadata.size !== document.size) {
        throw new Error(
          `Document size mismatch: expected ${document.size}, got ${metadata.size}`,
        );
      }

      if (metadata.mimeType && metadata.mimeType !== document.mimeType) {
        throw new Error(
          `Document mimeType mismatch: expected ${document.mimeType}, got ${metadata.mimeType}`,
        );
      }

      await this.storage.withTempFile(
        document.storageFilename,
        async (tempFilePath) => {
          const { text } =
            await this.documentParserService.parseDocumentFromFile(
              tempFilePath,
              document.mimeType,
            );

          await this.documentSearchService.index(document, text);
        },
      );

      await this.documentRepository.setStatus(documentId, 'success', null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.documentRepository.setStatus(
        documentId,
        'error',
        errorMessage,
      );
    }
  }
}
