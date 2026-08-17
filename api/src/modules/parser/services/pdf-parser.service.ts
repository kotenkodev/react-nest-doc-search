import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { readFile } from 'fs/promises';
import { FileParser } from '../interfaces/file-parser.interface';

@Injectable()
export class PdfParserService implements FileParser {
  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async extractContent(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return data.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse PDF document: ${message}`);
    } finally {
      await parser.destroy();
    }
  }

  async extractFromFile(filePath: string): Promise<string> {
    try {
      const buffer = await readFile(filePath);
      return await this.extractContent(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse PDF document: ${message}`);
    }
  }
}
