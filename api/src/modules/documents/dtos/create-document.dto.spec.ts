import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateDocumentDto } from './create-document.dto';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../../../common/constant';

describe('CreateDocumentDto validation', () => {
  const validPdfPayload = {
    userFilename: 'annual_report_2026.pdf',
    mimeType: ALLOWED_DOCUMENT_MIME_TYPES[0],
    size: 1024 * 1024,
  };

  const validDocxPayload = {
    userFilename: 'project_proposal.docx',
    mimeType: ALLOWED_DOCUMENT_MIME_TYPES[1],
    size: 2 * 1024 * 1024,
  };

  const validateDto = async (payload: unknown): Promise<ValidationError[]> => {
    const dto = plainToInstance(CreateDocumentDto, payload);
    return validate(dto);
  };

  describe('valid payloads', () => {
    it('should validate a valid PDF document payload', async () => {
      const errors = await validateDto(validPdfPayload);
      expect(errors).toHaveLength(0);
    });

    it('should validate a valid DOCX document payload', async () => {
      const errors = await validateDto(validDocxPayload);
      expect(errors).toHaveLength(0);
    });

    it('should allow filenames with case-insensitive extensions (.PDF, .DOCX)', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        userFilename: 'DOCUMENT.PDF',
      });
      expect(errors).toHaveLength(0);
    });

    it('should allow boundary file size (1 byte)', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        size: 1,
      });
      expect(errors).toHaveLength(0);
    });

    it('should allow boundary file size (exactly MAX_DOCUMENT_SIZE)', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        size: MAX_DOCUMENT_SIZE,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('userFilename validation', () => {
    it('should fail when userFilename is missing', async () => {
      const { userFilename, ...rest } = validPdfPayload;
      const errors = await validateDto(rest);
      expect(errors.some((e) => e.property === 'userFilename')).toBe(true);
    });

    it('should fail when userFilename is empty string', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        userFilename: '',
      });
      expect(errors.some((e) => e.property === 'userFilename')).toBe(true);
    });

    it('should fail when userFilename is not a string', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        userFilename: 12345,
      });
      expect(errors.some((e) => e.property === 'userFilename')).toBe(true);
    });

    it('should fail when userFilename exceeds 200 characters', async () => {
      const longName = 'a'.repeat(197) + '.pdf';
      const errors = await validateDto({
        ...validPdfPayload,
        userFilename: longName,
      });
      expect(errors.some((e) => e.property === 'userFilename')).toBe(true);
    });

    it('should fail when userFilename has an unallowed extension (.txt, .exe, .png)', async () => {
      const invalidExtensions = [
        'file.txt',
        'file.exe',
        'file.png',
        'file.pdf.zip',
        'file.pdf.exe',
      ];
      for (const filename of invalidExtensions) {
        const errors = await validateDto({
          ...validPdfPayload,
          userFilename: filename,
        });
        const filenameError = errors.find((e) => e.property === 'userFilename');
        expect(filenameError).toBeDefined();
        expect(filenameError?.constraints?.matches).toBeDefined();
      }
    });

    it('should fail when filename has no extension', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        userFilename: 'my_document',
      });
      expect(errors.some((e) => e.property === 'userFilename')).toBe(true);
    });
  });

  describe('mimeType validation', () => {
    it('should fail when mimeType is missing', async () => {
      const { mimeType, ...rest } = validPdfPayload;
      const errors = await validateDto(rest);
      expect(errors.some((e) => e.property === 'mimeType')).toBe(true);
    });

    it('should fail when mimeType is unsupported (e.g. image/jpeg, text/plain)', async () => {
      const invalidMimeTypes = [
        'image/jpeg',
        'text/plain',
        'application/zip',
        'application/msword',
      ];
      for (const mime of invalidMimeTypes) {
        const errors = await validateDto({
          ...validPdfPayload,
          mimeType: mime,
        });
        const mimeError = errors.find((e) => e.property === 'mimeType');
        expect(mimeError).toBeDefined();
        expect(mimeError?.constraints?.isIn).toBeDefined();
      }
    });
  });

  describe('size validation', () => {
    it('should fail when size is missing', async () => {
      const { size, ...rest } = validPdfPayload;
      const errors = await validateDto(rest);
      expect(errors.some((e) => e.property === 'size')).toBe(true);
    });

    it('should fail when size is 0 or negative', async () => {
      const zeroErrors = await validateDto({
        ...validPdfPayload,
        size: 0,
      });
      expect(zeroErrors.some((e) => e.property === 'size')).toBe(true);

      const negativeErrors = await validateDto({
        ...validPdfPayload,
        size: -500,
      });
      expect(negativeErrors.some((e) => e.property === 'size')).toBe(true);
    });

    it('should fail when size exceeds MAX_DOCUMENT_SIZE (10MB)', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        size: MAX_DOCUMENT_SIZE + 1,
      });
      const sizeError = errors.find((e) => e.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints?.max).toBeDefined();
    });

    it('should fail when size is not a number', async () => {
      const errors = await validateDto({
        ...validPdfPayload,
        size: '1048576',
      });
      expect(errors.some((e) => e.property === 'size')).toBe(true);
    });
  });
});
