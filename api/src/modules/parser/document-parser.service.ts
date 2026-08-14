import { Injectable } from '@nestjs/common';
import { WordParserService } from './services/word-parser.service';
import { PdfParserService } from './services/pdf-parser.service';
import { FileParser } from './interfaces/file-parser.interface';

@Injectable()
export class DocumentParserService {
  private readonly parsers: FileParser[];

  constructor(
    private readonly wordParser: WordParserService,
    private readonly pdfParser: PdfParserService,
  ) {
    this.parsers = [this.wordParser, this.pdfParser];
  }

  async parseDocument(
    url: string,
    mimeType: string,
  ): Promise<{ text: string; pageCount?: number }> {
    const parser = this.parsers.find((p) => p.supports(mimeType));

    if (!parser) {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch document from ${url}: ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await parser.extractContent(buffer);

    return { text };
  }
}
