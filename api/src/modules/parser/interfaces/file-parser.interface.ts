export interface FileParser {
  supports(mimeType: string): boolean;
  extractContent(buffer: Buffer): Promise<string>;
  extractFromFile(filePath: string): Promise<string>;
}

