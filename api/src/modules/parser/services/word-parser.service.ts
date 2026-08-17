import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { FileParser } from '../interfaces/file-parser.interface';

@Injectable()
export class WordParserService implements FileParser {
  supports(mimeType: string): boolean {
    return (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  async extractContent(buffer: Buffer): Promise<string> {
    try {
      const data = await mammoth.extractRawText({ buffer });
      return data.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse Word document: ${message}`);
    }
  }

  async extractFromFile(filePath: string): Promise<string> {
    try {
      const data = await mammoth.extractRawText({ path: filePath });
      return data.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse Word document: ${message}`);
    }
  }
}
