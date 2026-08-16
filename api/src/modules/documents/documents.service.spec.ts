import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './document.repository';
import { StorageService } from '../storage/storage.service';
import { SearchService } from '../search/search.service';
import { Document } from '../database/schema';
import { CreateDocumentDto } from './dtos/create-document.dto';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: jest.Mocked<DocumentsRepository>;
  let storageService: jest.Mocked<StorageService>;
  let searchService: jest.Mocked<SearchService>;

  // Sample mock document for testing
  const mockDocument: Document = {
    id: 'doc-123',
    ownerEmail: 'user@example.com',
    userFilename: 'contract.pdf',
    storageFilename: 'users/user@example.com/doc-123-contract.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 100,
    status: 'pending',
    error: null,
    uploadedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const mockRepo = {
      getDocuments: jest.fn(),
      getDocumentById: jest.fn(),
      create: jest.fn(),
      setStatus: jest.fn(),
      delete: jest.fn(),
    };

    const mockStorage = {
      getPresignedPostUrl: jest.fn(),
      getDownloadUrl: jest.fn(),
      deleteObject: jest.fn(),
    };

    const mockSearch = {
      index: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: DocumentsRepository, useValue: mockRepo },
        { provide: StorageService, useValue: mockStorage },
        { provide: SearchService, useValue: mockSearch },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get(DocumentsRepository);
    storageService = module.get(StorageService);
    searchService = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDocuments', () => {
    it('should return a list of documents and total count for an email', async () => {
      repository.getDocuments.mockResolvedValue([mockDocument]);

      const result = await service.getDocuments('user@example.com', undefined);

      expect(repository.getDocuments).toHaveBeenCalledWith('user@example.com');
      expect(result).toEqual({
        documents: [mockDocument],
        total: 1,
      });
    });
  });

  describe('getDocumentById', () => {
    it('should return the document when found and owned by the user', async () => {
      repository.getDocumentById.mockResolvedValue(mockDocument);

      const result = await service.getDocumentById(
        'user@example.com',
        'doc-123',
      );

      expect(result).toEqual(mockDocument);
      expect(repository.getDocumentById).toHaveBeenCalledWith('doc-123');
    });

    it('should throw NotFoundException if document does not exist', async () => {
      repository.getDocumentById.mockResolvedValue(undefined as any);

      await expect(
        service.getDocumentById('user@example.com', 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if document belongs to another user', async () => {
      repository.getDocumentById.mockResolvedValue({
        ...mockDocument,
        ownerEmail: 'other@example.com',
      });

      await expect(
        service.getDocumentById('user@example.com', 'doc-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createDocument', () => {
    it('should generate a presigned URL, save document to repository, and return both', async () => {
      const dto: CreateDocumentDto = {
        userFilename: 'my file.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      };
      const mockPresignedUrl = 'https://s3.amazonaws.com/bucket/presigned-url';

      storageService.getPresignedPostUrl.mockResolvedValue(mockPresignedUrl);
      repository.create.mockResolvedValue(mockDocument);

      const result = await service.createDocument('user@example.com', dto);

      expect(storageService.getPresignedPostUrl).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual({
        document: mockDocument,
        presignedPostUrl: mockPresignedUrl,
      });
    });
  });

  describe('getDownloadUrl', () => {
    it('should return download url for an existing document', async () => {
      repository.getDocumentById.mockResolvedValue(mockDocument);
      storageService.getDownloadUrl.mockResolvedValue(
        'https://download-url.com',
      );

      const result = await service.getDownloadUrl(
        'user@example.com',
        'doc-123',
      );

      expect(result).toEqual({ downloadUrl: 'https://download-url.com' });
    });
  });

  describe('deleteDocument', () => {
    it('should delete from repository and storage when document is found', async () => {
      repository.getDocumentById.mockResolvedValue(mockDocument);
      repository.delete.mockResolvedValue(mockDocument);
      storageService.deleteObject.mockResolvedValue(undefined);

      const result = await service.deleteDocument(
        'user@example.com',
        'doc-123',
      );

      expect(repository.delete).toHaveBeenCalledWith('doc-123');
      expect(storageService.deleteObject).toHaveBeenCalledWith(
        mockDocument.storageFilename,
      );
      expect(result).toBe(true);
    });

    it('should return false if deletion fails', async () => {
      repository.getDocumentById.mockResolvedValue(mockDocument);
      repository.delete.mockRejectedValue(new Error('DB Error'));

      const result = await service.deleteDocument(
        'user@example.com',
        'doc-123',
      );

      expect(result).toBe(false);
    });
  });
});
