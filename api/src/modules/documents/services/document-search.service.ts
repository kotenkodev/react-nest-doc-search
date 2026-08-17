import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Document } from '../../database/schema';
import { SearchService } from '../../search/search.service';
import { SearchDocument } from '../types/search-document.type';
import { DocumentHit } from '../types/document-hit.type';

@Injectable()
export class DocumentSearchService implements OnModuleInit {
  private readonly logger = new Logger(DocumentSearchService.name);
  private readonly INDEX = 'documents';

  constructor(private readonly searchService: SearchService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureIndex();
  }

  async ensureIndex(): Promise<void> {
    try {
      await this.searchService.createIndexIfNotExists(this.INDEX, {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            ownerEmail: {
              type: 'keyword',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            userFilename: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            content: { type: 'text' },
            uploadedAt: { type: 'date' },
          },
        },
      });
      this.logger.log(`OpenSearch index '${this.INDEX}' initialized.`);
    } catch (error) {
      this.logger.error(
        `Failed to ensure OpenSearch index '${this.INDEX}': ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

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
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { hits: [], total: 0 };
    }

    const terms = trimmedQuery.split(/\s+/).filter(Boolean);
    const wildcardQuery = terms
      .map((t) => `*${t.replace(/[+\-!(){}[\]^"~*?:\\/]/g, '\\$&')}*`)
      .join(' AND ');

    try {
      return await this.searchService.search<DocumentHit>(this.INDEX, {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      query_string: {
                        query: wildcardQuery,
                        fields: ['content'],
                        analyze_wildcard: true,
                        default_operator: 'AND',
                        boost: 3,
                      },
                    },
                    {
                      multi_match: {
                        query: trimmedQuery,
                        fields: ['content'],
                        type: 'phrase_prefix',
                        boost: 2,
                      },
                    },
                    {
                      multi_match: {
                        query: trimmedQuery,
                        fields: ['content'],
                        fuzziness: 'AUTO',
                        prefix_length: 1,
                      },
                    },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
            filter: [
              {
                bool: {
                  should: [
                    { term: { ownerEmail } },
                    { term: { 'ownerEmail.keyword': ownerEmail } },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
          },
        },
        highlight: {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 3,
            },
          },
        },
      });
    } catch (error: any) {
      if (
        error?.meta?.statusCode === 404 ||
        error?.body?.error?.type === 'index_not_found_exception' ||
        error?.message?.includes('index_not_found_exception')
      ) {
        return { hits: [], total: 0 };
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.searchService.delete(this.INDEX, id);
  }
}
