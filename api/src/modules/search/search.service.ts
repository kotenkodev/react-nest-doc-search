import { Inject, Injectable } from '@nestjs/common';
import { OPENSEARCH_CLIENT } from './search.provider';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class SearchService {
  constructor(@Inject(OPENSEARCH_CLIENT) private readonly client: Client) {}

  async indexExists(index: string): Promise<boolean> {
    const response = await this.client.indices.exists({ index });
    return Boolean(response.body);
  }

  async createIndexIfNotExists(
    index: string,
    body?: Record<string, any>,
  ): Promise<void> {
    const exists = await this.indexExists(index);
    if (!exists) {
      await this.client.indices.create({
        index,
        body,
      });
    }
  }

  async index<T extends Record<string, any>>(
    index: string,
    id: string,
    body: T,
  ): Promise<void> {
    await this.client.index({ index, id, body });
  }

  async delete(index: string, id: string): Promise<void> {
    await this.client.delete({ index, id });
  }

  async search<T>(
    index: string,
    queryBody: Record<string, any>,
  ): Promise<{ hits: T[]; total: number }> {
    const response = await this.client.search({ index, body: queryBody });
    const hits = response.body.hits.hits.map((hit: any) => ({
      ...hit._source,
      _id: hit._id,
      _score: hit._score,
      _highlight: hit.highlight,
    }));

    const totalRaw = response.body.hits?.total;
    const total =
      typeof totalRaw === 'number'
        ? totalRaw
        : typeof totalRaw?.value === 'number'
          ? totalRaw.value
          : 0;

    return { hits, total };
  }
}
