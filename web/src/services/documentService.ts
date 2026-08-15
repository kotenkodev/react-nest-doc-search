import type { DocumentItem } from "@/types/document.type";
import { api } from "./apiClient";
import { getMimeType } from "@/utils/document-parse";
import axios from "axios";

export const getDocuments = async (searchText: string) => {
  const response = await api.get<DocumentItem[]>("/documents", {
    params: searchText ? { searchText } : undefined,
  });
  return response.data;
};

export const initiateDocumentUpload = async (
  file: File,
  mimeType: string,
): Promise<{ document: DocumentItem; presignedPostUrl: string }> => {
  const response = await api.post<{
    document: DocumentItem;
    presignedPostUrl: string;
  }>("/documents", {
    userFilename: file.name,
    size: file.size,
    mimeType,
  });
  return response.data;
};

export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  mimeType: string,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  const response = await axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": mimeType,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`S3 upload failed with status: ${response.status}`);
  }
};

export const uploadDocument = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<DocumentItem> => {
  const mimeType = getMimeType(file);

  const { document, presignedPostUrl } = await initiateDocumentUpload(
    file,
    mimeType,
  );

  await uploadFileToS3(presignedPostUrl, file, mimeType, onProgress);
  return document;
};

export const deleteDocument = async (id: string) => {
  await api.delete(`/documents/${id}`);
};
