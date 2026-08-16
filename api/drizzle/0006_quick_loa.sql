CREATE INDEX "idx_documents_owner_email" ON "documents" USING btree ("ownerEmail");--> statement-breakpoint
CREATE INDEX "idx_documents_status" ON "documents" USING btree ("status");