# React & NestJS Document Search Monorepo

Full-stack document upload, processing, indexing, and full-text search application built with NestJS, React, AWS S3, AWS SQS, OpenSearch, and PostgreSQL.

---

## Architecture Flow Overview

```mermaid
sequenceDiagram
    autonumber
    actor User as User (React)
    participant Nest as NestJS API
    participant S3 as AWS S3
    participant SQS as AWS SQS
    participant OS as OpenSearch
    participant DB as PostgreSQL

    User->>Nest: Request presigned URL (userEmail, filename)
    Nest->>DB: Save doc record [status: pending, key: tmp/{id}-{name}]
    Nest-->>User: Return presigned URL
    User->>S3: Upload file directly to S3 bucket at tmp/
    S3->>SQS: Publish s3:ObjectCreated event to DocQueue
    Nest->>SQS: SQS Listener receives message
    Nest->>S3: Fetch file from tmp/
    Nest->>Nest: Parse PDF / Word text content
    Nest->>OS: Index parsed document text
    Nest->>S3: Copy file to {userEmail}/{s3Filename} & delete from tmp/
    Nest->>DB: Update status to [success] (or [error])
    Nest-->>User: Broadcast live status update via SSE connection
```

---

## Key Features & Lifecycle

1. **Pre-signed Uploads**: Frontend uploads directly to AWS S3 under `tmp/{s3-filename}`.
2. **S3 Lifecycle Rule**: Automatic 24-hour expiration for unprocessed temporary uploads in `tmp/`.
3. **Event-Driven Indexing**: S3 triggers `s3:ObjectCreated:*` events sent to AWS SQS `DocQueue`.
4. **Text Extraction & OpenSearch**: NestJS SQS listener parses PDF/Word text content and indexes full text to OpenSearch with fuzzy search support.
5. **Permanent Storage**: Processed files are moved from `tmp/` to `{userEmail}/{s3-filename}`.
6. **Real-time SSE Status**: Server-Sent Events notify the frontend live as document statuses change from `pending` -> `success` / `error`.
