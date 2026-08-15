import type { DocumentItem } from "./document.type";

export interface GetDocumentsResponse {
  documents: DocumentItem[];
  total: number;
}
