import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  text,
  integer,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['pending', 'success', 'error']);

export const documentsTable = pgTable('documents', {
  id: uuid().primaryKey().defaultRandom(),
  ownerEmail: varchar().notNull(),
  mimeType: varchar().notNull(),
  size: integer().notNull(),
  status: statusEnum().notNull().default('pending'),
  error: text(),
  storageFilename: varchar().unique().notNull(),
  userFilename: varchar().notNull(),
  uploadedAt: timestamp().defaultNow(),
});

export type Document = typeof documentsTable.$inferSelect;
export type NewDocument = typeof documentsTable.$inferInsert;
export type DocumentStatus = (typeof statusEnum.enumValues)[number];
