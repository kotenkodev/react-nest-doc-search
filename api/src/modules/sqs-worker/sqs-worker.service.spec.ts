import { Test, TestingModule } from '@nestjs/testing';
import { SqsWorkerService } from './sqs-worker.service';
import { SqsService } from '../sqs/sqs.service';
import { DocumentsRepository } from '../documents/document.repository';
import { DocumentParserService } from '../parser/document-parser.service';
import { StorageService } from '../storage/storage.service';
import { DocumentSearchService } from '../documents/services/document-search.service';
import { SseService } from '../sse/sse.service';
import { Message } from '@aws-sdk/client-sqs';

describe('SqsWorkerService', () => {
  let service: SqsWorkerService;
  let sqsService: jest.Mocked<SqsService>;
  let documentRepository: jest.Mocked<DocumentsRepository>;
  let documentParserService: jest.Mocked<DocumentParserService>;
  let documentSearchService: jest.Mocked<DocumentSearchService>;
  let storageService: jest.Mocked<StorageService>;

  const mockDocId = 'doc-123';
  const mockStorageFilename = 'users/user@example.com/doc-123-doc.pdf';
  const mockDocument = {
    id: mockDocId,
    ownerEmail: 'user@example.com',
    mimeType: 'application/pdf',
    size: 1024,
    status: 'pending' as const,
    error: null,
    storageFilename: mockStorageFilename,
    userFilename: 'doc.pdf',
    uploadedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsWorkerService,
        {
          provide: SqsService,
          useValue: {
            receive: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DocumentsRepository,
          useValue: {
            getDocumentByStorageFilename: jest.fn(),
            setStatus: jest.fn(),
          },
        },
        {
          provide: DocumentParserService,
          useValue: {
            parseDocumentFromFile: jest.fn(),
          },
        },
        {
          provide: DocumentSearchService,
          useValue: {
            index: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getObjectMetadata: jest.fn(),
            withTempFile: jest.fn(
              async (
                _key: string,
                callback: (path: string) => Promise<unknown>,
              ) => callback('/tmp/fake-temp.tmp'),
            ),
          },
        },
        {
          provide: SseService,
          useValue: {
            emit: jest.fn(),
            getEventsStream: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SqsWorkerService>(SqsWorkerService);
    sqsService = module.get(SqsService);
    documentRepository = module.get(DocumentsRepository);
    documentParserService = module.get(DocumentParserService);
    documentSearchService = module.get(DocumentSearchService);
    storageService = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processIncomingMessages', () => {
    it('should do nothing if no messages are received', async () => {
      sqsService.receive.mockResolvedValue([]);

      await service.processIncomingMessages();

      expect(sqsService.delete).not.toHaveBeenCalled();
    });

    it('should decode URL-encoded S3 key, process document and delete message', async () => {
      const s3EventPayload = {
        Records: [
          {
            eventName: 'ObjectCreated:Put',
            s3: {
              bucket: { name: 'test-bucket' },
              object: {
                key: 'users/user%40example.com/doc-123-doc.pdf',
                size: 1024,
              },
            },
          },
        ],
      };

      const mockMessage: Message = {
        MessageId: 'msg-1',
        ReceiptHandle: 'receipt-1',
        Body: JSON.stringify(s3EventPayload),
      };

      sqsService.receive.mockResolvedValue([mockMessage]);
      documentRepository.getDocumentByStorageFilename.mockResolvedValue(
        mockDocument,
      );
      storageService.getObjectMetadata.mockResolvedValue({
        size: 1024,
        mimeType: 'application/pdf',
      });
      documentParserService.parseDocumentFromFile.mockResolvedValue({
        text: 'parsed text',
      });
      documentSearchService.index.mockResolvedValue();
      documentRepository.setStatus.mockResolvedValue({
        ...mockDocument,
        status: 'success',
      });

      await service.processIncomingMessages();

      expect(
        documentRepository.getDocumentByStorageFilename,
      ).toHaveBeenCalledWith('users/user@example.com/doc-123-doc.pdf');
      expect(documentSearchService.index).toHaveBeenCalledWith(
        mockDocument,
        'parsed text',
      );
      expect(sqsService.delete).toHaveBeenCalledWith(mockMessage);
    });

    it('should ignore non ObjectCreated events', async () => {
      const s3EventPayload = {
        Records: [
          {
            eventName: 'ObjectRemoved:Delete',
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'some-key', size: 100 },
            },
          },
        ],
      };

      const mockMessage: Message = {
        MessageId: 'msg-1',
        ReceiptHandle: 'receipt-1',
        Body: JSON.stringify(s3EventPayload),
      };

      sqsService.receive.mockResolvedValue([mockMessage]);

      await service.processIncomingMessages();

      expect(
        documentRepository.getDocumentByStorageFilename,
      ).not.toHaveBeenCalled();
      expect(sqsService.delete).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe('processDocumentByStorageFilename', () => {
    it('should successfully parse, index document and update status to success', async () => {
      documentRepository.getDocumentByStorageFilename.mockResolvedValue(
        mockDocument,
      );
      storageService.getObjectMetadata.mockResolvedValue({
        size: 1024,
        mimeType: 'application/pdf',
      });
      documentParserService.parseDocumentFromFile.mockResolvedValue({
        text: 'parsed text content',
      });
      documentSearchService.index.mockResolvedValue();
      documentRepository.setStatus.mockResolvedValue({
        ...mockDocument,
        status: 'success',
      });

      await service.processDocumentByStorageFilename(mockStorageFilename);

      expect(
        documentRepository.getDocumentByStorageFilename,
      ).toHaveBeenCalledWith(mockStorageFilename);
      expect(storageService.getObjectMetadata).toHaveBeenCalledWith(
        mockDocument.storageFilename,
      );
      expect(storageService.withTempFile).toHaveBeenCalledWith(
        mockDocument.storageFilename,
        expect.any(Function),
      );
      expect(documentParserService.parseDocumentFromFile).toHaveBeenCalledWith(
        '/tmp/fake-temp.tmp',
        mockDocument.mimeType,
      );
      expect(documentSearchService.index).toHaveBeenCalledWith(
        mockDocument,
        'parsed text content',
      );
      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'success',
        null,
      );
    });

    it('should skip processing if document is already success', async () => {
      documentRepository.getDocumentByStorageFilename.mockResolvedValue({
        ...mockDocument,
        status: 'success',
      });

      await service.processDocumentByStorageFilename(mockStorageFilename);

      expect(storageService.getObjectMetadata).not.toHaveBeenCalled();
      expect(documentRepository.setStatus).not.toHaveBeenCalled();
    });

    it('should set status to error if file size does not match database record', async () => {
      documentRepository.getDocumentByStorageFilename.mockResolvedValue(
        mockDocument,
      );
      storageService.getObjectMetadata.mockResolvedValue({
        size: 99999,
        mimeType: 'application/pdf',
      });

      await expect(
        service.processDocumentByStorageFilename(mockStorageFilename),
      ).rejects.toThrow('Document size mismatch: expected 1024, got 99999');

      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'error',
        'Document size mismatch: expected 1024, got 99999',
      );
      expect(storageService.withTempFile).not.toHaveBeenCalled();
    });

    it('should set status to error if mime type does not match database record', async () => {
      documentRepository.getDocumentByStorageFilename.mockResolvedValue(
        mockDocument,
      );
      storageService.getObjectMetadata.mockResolvedValue({
        size: 1024,
        mimeType: 'image/png',
      });

      await expect(
        service.processDocumentByStorageFilename(mockStorageFilename),
      ).rejects.toThrow(
        'Document mimeType mismatch: expected application/pdf, got image/png',
      );

      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'error',
        'Document mimeType mismatch: expected application/pdf, got image/png',
      );
      expect(storageService.withTempFile).not.toHaveBeenCalled();
    });
  });
});
