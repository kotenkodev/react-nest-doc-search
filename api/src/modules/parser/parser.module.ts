import { Module } from '@nestjs/common';
import { DocumentParserService } from './document-parser.service';
import { WordParserService } from './services/word-parser.service';
import { PdfParserService } from './services/pdf-parser.service';

@Module({
  providers: [DocumentParserService, WordParserService, PdfParserService],
  exports: [DocumentParserService],
})
export class ParserModule {}
