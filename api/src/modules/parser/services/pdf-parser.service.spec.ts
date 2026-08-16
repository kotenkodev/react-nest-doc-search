import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';
import { PDFParse } from 'pdf-parse';
import * as fsPromises from 'fs/promises';

jest.mock('pdf-parse');
jest.mock('fs/promises');

describe('PdfParserService', () => {
  let service: PdfParserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfParserService],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('supports', () => {
    it('should return true for application/pdf', () => {
      expect(service.supports('application/pdf')).toBe(true);
    });

    it('should return false for unsupported mime types', () => {
      expect(service.supports('application/json')).toBe(false);
      expect(service.supports('text/plain')).toBe(false);
      expect(service.supports('image/png')).toBe(false);
    });
  });

  describe('extractContent', () => {
    it('should extract text from a valid PDF buffer and destroy parser instance', async () => {
      const mockBuffer = Buffer.from('fake pdf data');
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockGetText = jest
        .fn()
        .mockResolvedValue({ text: 'Extracted PDF text content' });

      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: mockDestroy,
      }));

      const result = await service.extractContent(mockBuffer);

      expect(PDFParse).toHaveBeenCalledWith({ data: mockBuffer });
      expect(mockGetText).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toBe('Extracted PDF text content');
    });

    it('should throw an error and destroy parser if extraction fails', async () => {
      const mockBuffer = Buffer.from('corrupt pdf data');
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockGetText = jest
        .fn()
        .mockRejectedValue(new Error('Invalid PDF header'));

      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: mockDestroy,
      }));

      await expect(service.extractContent(mockBuffer)).rejects.toThrow(
        'Failed to parse PDF document: Invalid PDF header',
      );
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('extractFromFile', () => {
    it('should read file and extract text using PDFParse', async () => {
      const mockFilePath = '/path/to/doc.pdf';
      const mockBuffer = Buffer.from('file pdf data');
      const mockDestroy = jest.fn().mockResolvedValue(undefined);
      const mockGetText = jest
        .fn()
        .mockResolvedValue({ text: 'Extracted PDF text from file' });

      (fsPromises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: mockDestroy,
      }));

      const result = await service.extractFromFile(mockFilePath);

      expect(fsPromises.readFile).toHaveBeenCalledWith(mockFilePath);
      expect(PDFParse).toHaveBeenCalledWith({ data: mockBuffer });
      expect(result).toBe('Extracted PDF text from file');
    });

    it('should throw an error if reading file fails', async () => {
      const mockFilePath = '/path/to/missing.pdf';
      (fsPromises.readFile as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file'),
      );

      await expect(service.extractFromFile(mockFilePath)).rejects.toThrow(
        'Failed to parse PDF document: ENOENT: no such file',
      );
    });
  });
});

