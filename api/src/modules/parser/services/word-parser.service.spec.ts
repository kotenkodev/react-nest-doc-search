import { Test, TestingModule } from '@nestjs/testing';
import { WordParserService } from './word-parser.service';
import * as mammoth from 'mammoth';

jest.mock('mammoth');

describe('WordParserService', () => {
  let service: WordParserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [WordParserService],
    }).compile();

    service = module.get<WordParserService>(WordParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('supports', () => {
    it('should return true for DOCX mime type', () => {
      expect(
        service.supports(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe(true);
    });

    it('should return false for other mime types', () => {
      expect(service.supports('application/pdf')).toBe(false);
      expect(service.supports('text/plain')).toBe(false);
    });
  });

  describe('extractContent', () => {
    it('should extract text from a valid Word buffer', async () => {
      const mockBuffer = Buffer.from('fake word data');
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Extracted Word text content',
        messages: [],
      });

      const result = await service.extractContent(mockBuffer);

      expect(mammoth.extractRawText).toHaveBeenCalledWith({
        buffer: mockBuffer,
      });
      expect(result).toBe('Extracted Word text content');
    });

    it('should throw an error if mammoth extraction fails', async () => {
      const mockBuffer = Buffer.from('corrupt word data');
      (mammoth.extractRawText as jest.Mock).mockRejectedValue(
        new Error('Corrupt zip archive'),
      );

      await expect(service.extractContent(mockBuffer)).rejects.toThrow(
        'Failed to parse Word document: Corrupt zip archive',
      );
    });
  });

  describe('extractFromFile', () => {
    it('should extract text from a file path', async () => {
      const mockPath = '/path/to/doc.docx';
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Extracted Word text from file',
        messages: [],
      });

      const result = await service.extractFromFile(mockPath);

      expect(mammoth.extractRawText).toHaveBeenCalledWith({
        path: mockPath,
      });
      expect(result).toBe('Extracted Word text from file');
    });

    it('should throw an error if mammoth extraction from file fails', async () => {
      const mockPath = '/path/to/corrupt.docx';
      (mammoth.extractRawText as jest.Mock).mockRejectedValue(
        new Error('File read error'),
      );

      await expect(service.extractFromFile(mockPath)).rejects.toThrow(
        'Failed to parse Word document: File read error',
      );
    });
  });
});
