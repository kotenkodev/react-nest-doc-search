CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ownerEmail" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"storageFilename" varchar NOT NULL,
	"userFilename" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
