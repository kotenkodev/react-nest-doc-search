import { Test, TestingModule } from '@nestjs/testing';
import { DocumentParserService } from './document-parser.service';
import { WordParserService } from './services/word-parser.service';
import { PdfParserService } from './services/pdf-parser.service';

describe('DocumentParserService', () => {
  let service: DocumentParserService;
  let wordParser: jest.Mocked<WordParserService>;
  let pdfParser: jest.Mocked<PdfParserService>;

  const mockPdfMimeType = 'application/pdf';
  const mockWordMimeType =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const mockUrl = 'https://s3.amazonaws.com/bucket/doc.pdf';

  beforeEach(async () => {
    const mockWord = {
      supports: jest.fn((mime) => mime === mockWordMimeType),
      extractContent: jest.fn(),
      extractFromFile: jest.fn(),
    };

    const mockPdf = {
      supports: jest.fn((mime) => mime === mockPdfMimeType),
      extractContent: jest.fn(),
      extractFromFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentParserService,
        { provide: WordParserService, useValue: mockWord },
        { provide: PdfParserService, useValue: mockPdf },
      ],
    }).compile();

    service = module.get<DocumentParserService>(DocumentParserService);
    wordParser = module.get(WordParserService);
    pdfParser = module.get(PdfParserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseDocument', () => {
    it('should throw an error if the mimeType is not supported', async () => {
      const unsupportedMime = 'image/png';

      await expect(
        service.parseDocument(mockUrl, unsupportedMime),
      ).rejects.toThrow('Unsupported mime type: image/png');
    });

    it('should throw an error if fetching the document from the URL fails', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(
        service.parseDocument(mockUrl, mockPdfMimeType),
      ).rejects.toThrow(`Failed to fetch document from ${mockUrl}: Not Found`);
    });

    it('should download and extract text using PdfParserService for PDF documents', async () => {
      const fakeContent = 'Sample extracted PDF text';
      const fakeArrayBuffer = new ArrayBuffer(8);

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(fakeArrayBuffer),
      } as unknown as Response);

      pdfParser.extractContent.mockResolvedValue(fakeContent);

      const result = await service.parseDocument(mockUrl, mockPdfMimeType);

      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
      expect(pdfParser.extractContent).toHaveBeenCalled();
      expect(result).toEqual({ text: fakeContent });
    });

    it('should download and extract text using WordParserService for Word documents', async () => {
      const fakeContent = 'Sample extracted Word text';
      const fakeArrayBuffer = new ArrayBuffer(8);

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(fakeArrayBuffer),
      } as unknown as Response);

      wordParser.extractContent.mockResolvedValue(fakeContent);

      const result = await service.parseDocument(mockUrl, mockWordMimeType);

      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
      expect(wordParser.extractContent).toHaveBeenCalled();
      expect(result).toEqual({ text: fakeContent });
    });
  });

  describe('parseDocumentFromFile', () => {
    const mockFilePath = '/tmp/doc-123.tmp';

    it('should throw an error if the mimeType is not supported', async () => {
      const unsupportedMime = 'image/png';

      await expect(
        service.parseDocumentFromFile(mockFilePath, unsupportedMime),
      ).rejects.toThrow('Unsupported mime type: image/png');
    });

    it('should extract text from file using PdfParserService for PDF documents', async () => {
      const fakeContent = 'PDF text from file';
      pdfParser.extractFromFile.mockResolvedValue(fakeContent);

      const result = await service.parseDocumentFromFile(
        mockFilePath,
        mockPdfMimeType,
      );

      expect(pdfParser.extractFromFile).toHaveBeenCalledWith(mockFilePath);
      expect(result).toEqual({ text: fakeContent });
    });

    it('should extract text from file using WordParserService for Word documents', async () => {
      const fakeContent = 'Word text from file';
      wordParser.extractFromFile.mockResolvedValue(fakeContent);

      const result = await service.parseDocumentFromFile(
        mockFilePath,
        mockWordMimeType,
      );

      expect(wordParser.extractFromFile).toHaveBeenCalledWith(mockFilePath);
      expect(result).toEqual({ text: fakeContent });
    });
  });
});

