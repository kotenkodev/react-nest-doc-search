import { Test, TestingModule } from '@nestjs/testing';
import { SqsWorkerService } from './sqs-worker.service';
import { SqsService } from '../sqs/sqs.service';
import { DocumentsRepository } from '../documents/document.repository';
import { DocumentParserService } from '../parser/document-parser.service';
import { StorageService } from '../storage/storage.service';
import { DocumentSearchService } from '../documents/services/document-search.service';

describe('SqsWorkerService', () => {
  let service: SqsWorkerService;
  let documentRepository: jest.Mocked<DocumentsRepository>;
  let documentParserService: jest.Mocked<DocumentParserService>;
  let documentSearchService: jest.Mocked<DocumentSearchService>;
  let storageService: jest.Mocked<StorageService>;

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
            getDocumentById: jest.fn(),
            setStatus: jest.fn(),
          },
        },
        {
          provide: DocumentParserService,
          useValue: {
            parseDocument: jest.fn(),
            parseDocumentFromFile: jest.fn(),
          },
        },
        {
          provide: DocumentSearchService,
          useValue: {
            index: jest.fn(),
            search: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getDownloadUrl: jest.fn(),
            getObjectMetadata: jest.fn(),
            withTempFile: jest.fn(
              async (
                _key: string,
                callback: (path: string) => Promise<unknown>,
              ) => callback('/tmp/fake-temp.tmp'),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<SqsWorkerService>(SqsWorkerService);
    documentRepository = module.get(DocumentsRepository);
    documentParserService = module.get(DocumentParserService);
    documentSearchService = module.get(DocumentSearchService);
    storageService = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processDocumentMessage', () => {
    const mockDocId = 'doc-123';
    const mockDocument = {
      id: mockDocId,
      ownerEmail: 'user@example.com',
      mimeType: 'application/pdf',
      size: 1024,
      status: 'pending' as const,
      error: null,
      storageFilename: 'storage/doc.pdf',
      userFilename: 'doc.pdf',
      uploadedAt: new Date(),
    };

    it('should successfully stream to temp file, parse, index document and update status to success', async () => {
      documentRepository.getDocumentById.mockResolvedValue(mockDocument);
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

      await service.processDocumentMessage(mockDocId);

      expect(documentRepository.getDocumentById).toHaveBeenCalledWith(
        mockDocId,
      );
      expect(storageService.getObjectMetadata).toHaveBeenCalledWith(
        mockDocument.storageFilename,
      );
      expect(storageService.withTempFile).toHaveBeenCalledWith(
        mockDocument.storageFilename,
        expect.any(Function),
      );
      expect(
        documentParserService.parseDocumentFromFile,
      ).toHaveBeenCalledWith('/tmp/fake-temp.tmp', mockDocument.mimeType);
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

    it('should set status to error if file size does not match database record', async () => {
      documentRepository.getDocumentById.mockResolvedValue(mockDocument);
      storageService.getObjectMetadata.mockResolvedValue({
        size: 99999,
        mimeType: 'application/pdf',
      });

      await service.processDocumentMessage(mockDocId);

      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'error',
        'Document size mismatch: expected 1024, got 99999',
      );
      expect(storageService.withTempFile).not.toHaveBeenCalled();
    });

    it('should set status to error if mime type does not match database record', async () => {
      documentRepository.getDocumentById.mockResolvedValue(mockDocument);
      storageService.getObjectMetadata.mockResolvedValue({
        size: 1024,
        mimeType: 'image/png',
      });

      await service.processDocumentMessage(mockDocId);

      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'error',
        'Document mimeType mismatch: expected application/pdf, got image/png',
      );
      expect(storageService.withTempFile).not.toHaveBeenCalled();
    });

    it('should set status to error if processing fails', async () => {
      documentRepository.getDocumentById.mockRejectedValue(
        new Error('DB failure'),
      );

      await service.processDocumentMessage(mockDocId);

      expect(documentRepository.setStatus).toHaveBeenCalledWith(
        mockDocId,
        'error',
        'DB failure',
      );
    });
  });
});

