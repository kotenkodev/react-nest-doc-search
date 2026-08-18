# NestJS Document Search API

Backend REST API, AWS SQS event-driven background worker, OpenSearch full-text indexing, and Server-Sent Events (SSE) service built with [NestJS 11](https://nestjs.com/) and [Drizzle ORM](https://orm.drizzle.team/).

---

## Features

- **Direct-to-S3 Pre-signed Uploads**: Issues secure pre-signed URLs for direct client-to-S3 file uploads.
- **Asynchronous SQS Worker**: Automatically polls and processes `s3:ObjectCreated` events from AWS SQS.
- **Document Text Parsers**: Extracts text content from PDF (`pdf-parse`) and DOCX (`mammoth`) files.
- **OpenSearch Indexing & Search**: Indexes parsed documents with fuzzy matching and search snippet highlighting.
- **Per-User Server-Sent Events (SSE)**: Streams real-time processing status updates (`pending` $\rightarrow$ `success` / `error`) scoped per user.
- **Fault-Tolerant Queue & DLQ**: Handles errors gracefully, deletes processed messages, and supports AWS SQS Dead-Letter Queue for unhandled failures.

---

## Architecture & Module Structure

```text
src/
├── config/                  # Configuration loaders (Joi validation, AWS, DB, App)
├── modules/
│   ├── database/            # Drizzle ORM PostgreSQL connection & schema definitions
│   ├── documents/           # Document CRUD, search query dispatch, and download endpoints
│   ├── parser/              # PDF and DOCX text extraction services
│   ├── search/              # OpenSearch client and index management
│   ├── sqs/                 # AWS SQS client wrapper (receive, delete)
│   ├── sqs-worker/          # Background worker service polling and processing S3 events
│   ├── sse/                 # Real-time SSE service and /sse endpoint
│   └── storage/             # AWS S3 pre-signed upload & download URL generator
└── shared/                  # Email auth guard, logging middleware, and global exception filters
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | API server port | `3000` | No |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` | No |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated or single) | `http://localhost:5173` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_USERNAME` | PostgreSQL username | `postgres` | Yes |
| `DB_PASSWORD` | PostgreSQL password | `postgrespassword` | Yes |
| `DB_NAME` | PostgreSQL database name | `app_db` | Yes |
| `DB_SYNC` | Auto-sync schema (use migrations in production) | `false` | No |
| `AWS_REGION` | AWS region for S3 and SQS | `us-east-1` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | - | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | - | Yes |
| `AWS_BUCKET_NAME` | AWS S3 bucket name for documents | - | Yes |
| `AWS_SQS_QUEUE_URL` | AWS SQS Queue URL | - | Yes |
| `OPENSEARCH_NODE` | OpenSearch endpoint URL | `http://localhost:9200` | Yes |
| `OPENSEARCH_AUTH_USERNAME` | OpenSearch username | `admin` | Yes |
| `OPENSEARCH_AUTH_PASSWORD` | OpenSearch password | `Admin12345!` | Yes |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

Generate and run Drizzle schema migrations:

```bash
# Generate SQL migration files from schema
npm run generate

# Apply migrations to PostgreSQL
npm run migrate
```

> **Tip**: Run `npm run studio` to open Drizzle Studio for visual database inspection.

### 3. Start the Server

```bash
# Development mode (hot reload)
npm run start:dev

# Debug mode
npm run start:debug

# Production build & run
npm run build
npm run start:prod
```

---

## API Reference

All document routes require the `x-user-email` header (handled by `EmailGuard`).

### 1. Document Management

- **Search & List Documents**
  - `GET /documents?searchText={query}`
  - Headers: `x-user-email: user@example.com`
  - Returns: `{ documents: DocumentItem[], total: number }`

- **Initiate Document Upload**
  - `POST /documents`
  - Headers: `x-user-email: user@example.com`
  - Body: `{ "userFilename": "report.pdf", "mimeType": "application/pdf", "size": 102400 }`
  - Returns: `{ document: DocumentItem, presignedPostUrl: string }`

- **Get Document by ID**
  - `GET /documents/:id`
  - Headers: `x-user-email: user@example.com`

- **Get Secure Download URL**
  - `GET /documents/:id/download`
  - Headers: `x-user-email: user@example.com`
  - Returns: `{ "downloadUrl": "https://s3..." }`

- **Delete Document**
  - `DELETE /documents/:id`
  - Headers: `x-user-email: user@example.com`

### 2. Server-Sent Events (SSE)

- **Real-Time Event Stream**
  - `GET /sse?email={userEmail}`
  - Stream format: `data: { "type": "document.updated", "ownerEmail": "...", "data": { "id": "...", "status": "success" | "error" } }`

---

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage report
npm run test:cov

# Run End-to-End (E2E) tests
npm run test:e2e
```
