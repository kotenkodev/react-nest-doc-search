import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import {
  documentsTable,
  DocumentStatus,
  NewDocument,
  Document,
} from '../database/schema';
import { DRIZZLE } from '../database/database.constants';
import type { Database } from '../database/database.provider';

@Injectable()
export class DocumentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getDocuments(email: string): Promise<Document[]> {
    return await this.db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.ownerEmail, email));
  }

  async getDocumentsByIds(ids: string[], email: string): Promise<Document[]> {
    if (!ids.length) return [];
    return await this.db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.ownerEmail, email),
          inArray(documentsTable.id, ids),
        ),
      );
  }

  async getDocumentById(id: string): Promise<Document> {
    const [document] = await this.db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, id));
    return document;
  }

  async getDocumentByStorageFilename(
    storageFilename: string,
  ): Promise<Document> {
    const [document] = await this.db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.storageFilename, storageFilename));
    return document;
  }

  async create(data: NewDocument): Promise<Document> {
    const [document] = await this.db
      .insert(documentsTable)
      .values(data)
      .returning();
    return document;
  }

  async setStatus(
    id: string,
    status: DocumentStatus,
    error: string | null = null,
  ): Promise<Document> {
    const [document] = await this.db
      .update(documentsTable)
      .set({ status, error })
      .where(eq(documentsTable.id, id))
      .returning();
    return document;
  }

  async delete(id: string): Promise<Document> {
    const [document] = await this.db
      .delete(documentsTable)
      .where(eq(documentsTable.id, id))
      .returning();
    return document;
  }
}
