import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { SqsService } from '../sqs/sqs.service';
import { DocumentsRepository } from '../documents/document.repository';
import { DocumentParserService } from '../parser/document-parser.service';
import { DocumentSearchService } from '../documents/services/document-search.service';
import { DocumentStatus } from '../database/schema';
import { Message } from '@aws-sdk/client-sqs';
import { S3EventRecord, S3SqsEventPayload } from '../sqs/types/s3-event.type';
import { SseService } from '../sse/sse.service';

@Injectable()
export class SqsWorkerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(SqsWorkerService.name);
  private isRunning = false;

  constructor(
    private readonly sqsService: SqsService,
    private readonly documentRepository: DocumentsRepository,
    private readonly documentParserService: DocumentParserService,
    private readonly documentSearchService: DocumentSearchService,
    private readonly storage: StorageService,
    private readonly sseService: SseService,
  ) {}

  onApplicationBootstrap() {
    this.startWorker();
  }

  onApplicationShutdown() {
    this.stopWorker();
  }

  startWorker() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.log('SQS Worker started');
    void this.pollLoop();
  }

  stopWorker() {
    this.isRunning = false;
    this.logger.log('SQS Worker stopped');
  }

  private async pollLoop() {
    while (this.isRunning) {
      try {
        await this.processIncomingMessages();
      } catch (error) {
        this.logger.error('Error during SQS polling loop:', error);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async processIncomingMessages(): Promise<void> {
    const messages: Message[] = await this.sqsService.receive();
    if (!messages || messages.length === 0) {
      return;
    }

    await Promise.allSettled(
      messages.map((message) => this.processSingleMessage(message)),
    );
  }

  private async processSingleMessage(message: Message): Promise<void> {
    if (!message.Body) {
      await this.sqsService.delete(message);
      return;
    }

    try {
      await this.handleSqsMessage(message.Body);
    } catch (error) {
      this.logger.error(
        `Failed to process SQS message ID ${message.MessageId}:`,
        error,
      );
    } finally {
      await this.sqsService.delete(message);
    }
  }

  private async handleSqsMessage(body: string): Promise<void> {
    let payload: S3SqsEventPayload;
    try {
      payload = JSON.parse(body) as S3SqsEventPayload;
    } catch {
      this.logger.warn('Received invalid JSON message body in SQS');
      return;
    }

    if (!payload?.Records || !Array.isArray(payload.Records)) {
      this.logger.warn('Received message body without Records array');
      return;
    }

    for (const record of payload.Records) {
      await this.processS3Record(record);
    }
  }

  private async processS3Record(record: S3EventRecord): Promise<void> {
    if (!record.eventName || !record.eventName.startsWith('ObjectCreated:')) {
      this.logger.debug(`Skipping non-creation event: ${record.eventName}`);
      return;
    }

    const rawKey = record.s3?.object?.key;
    if (!rawKey) {
      this.logger.warn('S3 record missing object key');
      return;
    }

    const storageFilename = decodeURIComponent(rawKey.replace(/\+/g, ' '));
    const fileSize = record.s3.object.size;
    const bucket = record.s3.bucket?.name;

    this.logger.log(
      `Received S3 ObjectCreated event for "${storageFilename}" in bucket "${bucket}" (${fileSize ?? 'unknown'} bytes)`,
    );

    await this.processDocumentByStorageFilename(storageFilename);
  }

  async processDocumentByStorageFilename(
    storageFilename: string,
  ): Promise<void> {
    const document =
      await this.documentRepository.getDocumentByStorageFilename(
        storageFilename,
      );

    if (!document) {
      this.logger.error(
        `Document with storageFilename "${storageFilename}" not found in database`,
      );
      return;
    }

    if (
      document.status === DocumentStatus.SUCCESS ||
      document.status === DocumentStatus.ERROR
    ) {
      this.logger.warn(
        `Document ${document.id} (${storageFilename}) is already in state "${document.status}". Skipping.`,
      );
      return;
    }

    try {
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

      await this.documentRepository.setStatus(
        document.id,
        DocumentStatus.SUCCESS,
        null,
      );

      this.sseService.emit({
        type: 'document.updated',
        ownerEmail: document.ownerEmail,
        data: {
          id: document.id,
          userFilename: document.userFilename,
          status: DocumentStatus.SUCCESS,
        },
      });

      this.logger.log(
        `Successfully indexed document ${document.id} (${document.userFilename})`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process document ${document.id}: ${errorMessage}`,
      );

      await this.documentRepository.setStatus(
        document.id,
        DocumentStatus.ERROR,
        errorMessage,
      );

      this.sseService.emit({
        type: 'document.updated',
        ownerEmail: document.ownerEmail,
        data: {
          id: document.id,
          userFilename: document.userFilename,
          status: DocumentStatus.ERROR,
          error: errorMessage,
        },
      });

      throw error;
    }
  }
}
