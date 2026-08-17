import { Injectable } from '@nestjs/common';
import type { Document } from '../../database/schema';
import { SearchService } from '../../search/search.service';
import { SearchDocument } from 'src/modules/documents/types/search-document.type';
import { DocumentHit } from 'src/modules/documents/types/document-hit.type';

@Injectable()
export class DocumentSearchService {
  private readonly INDEX = 'documents';

  constructor(private readonly searchService: SearchService) {}

  async index(document: Document, content: string): Promise<void> {
    const payload: SearchDocument = {
      id: document.id,
      ownerEmail: document.ownerEmail,
      userFilename: document.userFilename,
      uploadedAt: document.uploadedAt.toISOString(),
      content,
    };

    await this.searchService.index(this.INDEX, document.id, payload);
  }

  async search(ownerEmail: string, query: string) {
    return this.searchService.search<DocumentHit>(this.INDEX, {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['userFilename^2', 'content'],
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [{ term: { ownerEmail } }],
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.searchService.delete(this.INDEX, id);
  }
}
