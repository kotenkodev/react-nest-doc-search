import { index } from 'drizzle-orm/pg-core';
import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  text,
  integer,
} from 'drizzle-orm/pg-core';

export const DocumentStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const statusEnum = pgEnum('status', [
  DocumentStatus.PENDING,
  DocumentStatus.SUCCESS,
  DocumentStatus.ERROR,
]);

export const documentsTable = pgTable(
  'documents',
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerEmail: varchar().notNull(),
    mimeType: varchar().notNull(),
    size: integer().notNull(),
    status: statusEnum().notNull().default('pending'),
    error: text(),
    storageFilename: varchar().unique().notNull(),
    userFilename: varchar().notNull(),
    uploadedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index('idx_documents_owner_email').on(table.ownerEmail),
    index('idx_documents_status').on(table.status),
  ],
);

export type Document = typeof documentsTable.$inferSelect;
export type NewDocument = typeof documentsTable.$inferInsert;
