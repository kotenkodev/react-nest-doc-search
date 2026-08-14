import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  indexDocument(document: Document) {}

  searchDocuments(query: string) {}
}
