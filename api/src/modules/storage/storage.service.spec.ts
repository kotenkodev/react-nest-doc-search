import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3_BUCKET, S3_CLIENT } from './storage.contants';
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { unlink } from 'fs/promises';

describe('StorageService', () => {
  let service: StorageService;
  let s3Client: jest.Mocked<Pick<S3Client, 'send'>>;

  beforeEach(async () => {
    const mockS3Client = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: S3_CLIENT,
          useValue: mockS3Client,
        },
        {
          provide: S3_BUCKET,
          useValue: 'test-bucket',
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    s3Client = module.get(S3_CLIENT);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getObjectMetadata', () => {
    it('should return size and mimeType from HeadObject response', async () => {
      s3Client.send.mockResolvedValueOnce({
        ContentLength: 2048,
        ContentType: 'application/pdf',
      } as any);

      const metadata = await service.getObjectMetadata(
        'users/test@example.com/doc.pdf',
      );

      expect(s3Client.send).toHaveBeenCalledWith(
        expect.any(HeadObjectCommand),
      );
      expect(metadata).toEqual({
        size: 2048,
        mimeType: 'application/pdf',
      });
    });
  });

  describe('getObjectStream', () => {
    it('should return a readable stream from S3', async () => {
      const mockStream = Readable.from(['file content chunk']);
      s3Client.send.mockResolvedValueOnce({
        Body: mockStream,
      } as any);

      const stream = await service.getObjectStream(
        'users/test@example.com/doc.pdf',
      );

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      expect(stream).toBe(mockStream);
    });
  });

  describe('downloadToTempFile', () => {
    it('should stream S3 content to a temporary file on disk and return the path', async () => {
      const mockStream = Readable.from(['temp file content']);
      s3Client.send.mockResolvedValueOnce({
        Body: mockStream,
      } as any);

      const tempPath = await service.downloadToTempFile(
        'users/test@example.com/doc.pdf',
      );

      expect(tempPath).toContain('.tmp');

      // Cleanup created temp file
      await unlink(tempPath).catch(() => {});
    });
  });

  describe('deleteObject', () => {
    it('should send DeleteObjectCommand to S3', async () => {
      s3Client.send.mockResolvedValueOnce({} as any);

      await service.deleteObject('users/test@example.com/doc.pdf');

      expect(s3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
    });
  });
});
