import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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

  async getDocumentById(id: string): Promise<Document> {
    const [document] = await this.db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, id));
    return document;
  }

  async create(data: NewDocument): Promise<Document> {
    const [document] = await this.db
      .insert(documentsTable)
      .values(data)
      .returning();
    return document;
  }

  async setStatus(id: string, status: DocumentStatus): Promise<Document> {
    const [document] = await this.db
      .update(documentsTable)
      .set({ status })
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
