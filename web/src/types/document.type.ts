export interface DocumentItem {
  id: string;
  ownerEmail: string;
  userFilename: string;
  storageFilename: string;
  mimeType: string;
  size: number;
  status: "pending" | "success" | "error";
  uploadedAt: string;
  error?: string | null;
  highlight?: string;
}
