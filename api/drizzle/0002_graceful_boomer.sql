CREATE TYPE "public"."status" AS ENUM('pending', 'success', 'error');--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "createdAt" TO "uploadedAt";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."status";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";