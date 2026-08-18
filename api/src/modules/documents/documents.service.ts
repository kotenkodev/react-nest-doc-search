import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { DocumentsRepository } from './document.repository';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { Document, DocumentStatus } from '../database/schema';
import { randomUUID } from 'crypto';
import { DocumentSearchService } from './services/document-search.service';

function highlightExactSubstring(text: string, searchText: string): string {
  if (!text || !searchText) return text;
  const terms = searchText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) return text;

  const termRegex = new RegExp(`(${terms.join('|')})`, 'gi');

  return text.replace(/<em>(.*?)<\/em>/gi, (match, innerText) => {
    if (termRegex.test(innerText)) {
      return innerText.replace(termRegex, '<em>$1</em>');
    }
    return `<em>${innerText}</em>`;
  });
}

export type DocumentWithHighlight = Document & {
  highlight?: string;
};

@Injectable()
export class DocumentsService {
  constructor(
    private readonly storage: StorageService,
    private readonly documentSearch: DocumentSearchService,
    private readonly repository: DocumentsRepository,
  ) {}

  async getDocuments(
    email: string,
    searchText: string | undefined,
  ): Promise<{ documents: DocumentWithHighlight[]; total: number }> {
    const trimmedSearch = searchText?.trim();
    if (trimmedSearch) {
      const searchResult = await this.documentSearch.search(
        email,
        trimmedSearch,
      );
      const ids = searchResult.hits.map((hit) => hit.id);

      if (ids.length === 0) {
        return {
          documents: [],
          total: 0,
        };
      }

      const documents = await this.repository.getDocumentsByIds(ids, email);
      const documentMap = new Map(documents.map((doc) => [doc.id, doc]));

      const documentsWithHighlights: DocumentWithHighlight[] = [];

      for (const hit of searchResult.hits) {
        const doc = documentMap.get(hit.id);
        if (!doc) continue;

        const rawHighlight = hit._highlight?.content?.join(' ... ');

        const highlight = rawHighlight
          ? highlightExactSubstring(rawHighlight, trimmedSearch)
          : undefined;

        documentsWithHighlights.push({
          ...doc,
          ...(highlight ? { highlight } : {}),
        });
      }

      return {
        documents: documentsWithHighlights,
        total: documentsWithHighlights.length,
      };
    }

    const documents = await this.repository.getDocuments(email);

    return {
      documents,
      total: documents.length,
    };
  }

  async getDocumentById(email: string, id: string): Promise<Document> {
    const document = await this.repository.getDocumentById(id);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.ownerEmail !== email) {
      throw new ForbiddenException('You are not the owner of this document');
    }

    return document;
  }

  async getDownloadUrl(
    email: string,
    id: string,
  ): Promise<{ downloadUrl: string }> {
    const document = await this.getDocumentById(email, id);
    const downloadUrl = await this.storage.getDownloadUrl(
      document.storageFilename,
      document.userFilename,
    );
    return { downloadUrl };
  }

  async createDocument(
    email: string,
    data: CreateDocumentDto,
  ): Promise<{
    document: Document;
    presignedPostUrl: string;
  }> {
    const sanitizedFilename = data.userFilename.replace(/\s+/g, '_');
    const storageFilename = `users/${email}/${randomUUID()}-${sanitizedFilename}`;

    const presignedPostUrl = await this.storage.getPresignedPostUrl(
      storageFilename,
      data.mimeType,
      data.size,
    );

    const document = await this.repository.create({
      ...data,
      ownerEmail: email,
      storageFilename,
    });

    return {
      document,
      presignedPostUrl,
    };
  }

  async setStatus(
    id: string,
    status: DocumentStatus,
    error: string | null = null,
  ): Promise<Document> {
    const updatedDocument = await this.repository.setStatus(id, status, error);

    return updatedDocument;
  }

  async deleteDocument(email: string, id: string): Promise<boolean> {
    const document = await this.getDocumentById(email, id);

    try {
      await this.repository.delete(document.id);
      await this.storage.deleteObject(document.storageFilename);

      return true;
    } catch (error) {
      console.error('Failed to delete document', error);

      return false;
    }
  }
}
