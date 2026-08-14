ALTER TABLE "documents" ADD COLUMN "mimeType" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "error" text;