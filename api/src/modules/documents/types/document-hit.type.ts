export type DocumentHit = {
  id: string;
  ownerEmail: string;
  userFilename: string;
  content: string;
  uploadedAt: string;
  _id: string;
  _score: number;
  _highlight?: {
    content?: string[];
    userFilename?: string[];
  };
};
