# React Document Search Web Client

Frontend web application built with [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [@primer/react](https://primer.style/react/), [Tailwind CSS v4](https://tailwindcss.com/), [TanStack Query](https://tanstack.com/query/latest), and [Zustand](https://zustand-demo.pmnd.rs/).

---

## Features

- **GitHub Primer Design System**: Consistent GitHub Primer components (Data table, blankslates, labels, icons, and buttons).
- **Direct S3 Upload**: Uploads files directly to S3 via pre-signed URLs with live percentage progress tracking.
- **Real-Time SSE Sync**: Uses a single per-user Server-Sent Events hook (`useDocumentSse`) that invalidates React Query cache and notifies the user via Sonner toasts when document processing finishes.
- **Fuzzy & Highlighted Search**: Debounced search bar with instant full-text search results and yellow phrase highlighting (`<em>`).
- **Secure Authentication State**: Zustand-based session management persisting the active user email.

---

## Project Structure

```text
src/
├── components/              # UI Components
│   ├── layout/              # ProtectedRoute, PublicRoute, Header, Layout
│   ├── DocumentList.tsx     # Primer DataTable rendering documents & status badges
│   ├── SearchBar.tsx        # Debounced search input with total document counter
│   ├── SkeletonList.tsx     # Skeleton loading state placeholders
│   ├── ToastNotification.tsx# Custom toast UI for upload and indexing states
│   └── ThemeProvider.tsx    # Primer theme and color scheme context
├── hooks/                   # Custom React Hooks
│   ├── useDebounce.ts       # Debounce utility hook for search input
│   ├── useDocuments.ts      # TanStack React Query queries and mutations
│   ├── useDocumentSse.ts    # Single per-user Server-Sent Events connection hook
│   └── useFileUpload.ts     # File dialog and upload orchestration hook
├── pages/                   # Application Views
│   ├── Dashboard.tsx        # Main search and document list dashboard
│   └── Auth.tsx             # Simple email login/switch screen
├── services/                # API Client Layer
│   ├── apiClient.ts         # Axios instance with x-user-email interceptor
│   └── documentService.ts   # Document API endpoints & S3 upload helpers
├── store/                   # State Management
│   └── useAuthStore.ts      # Zustand store for user email & authentication
└── types/                   # TypeScript Type Definitions
    ├── api-response.ts      # API payload types
    └── document.type.ts     # DocumentItem and status types
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the NestJS Backend API | `http://localhost:3000` |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Type-check with TypeScript and build the production bundle in `dist/` |
| `npm run preview` | Locally preview the production build output |
| `npm run lint` | Run ESLint across the project |

---

## Deployment to Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `web`.
3. Framework Preset: **Vite**.
4. Configure the Environment Variable:
   - `VITE_API_URL`: `http://<EC2_PUBLIC_IP>:3000` (or your backend domain)
5. Deploy! The included [`vercel.json`](./vercel.json) handles client-side routing so refreshing pages works seamlessly without 404 errors.
