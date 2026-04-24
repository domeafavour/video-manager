# Video Manager

简体中文: [README.zh-CN.md](README.zh-CN.md)

Desktop app for organizing video-related resources by project.

Built with Electron + Vite + React, with IndexedDB for local persistence.

## Features

- Project management
  - Create, update, and delete projects
  - Auto-open project tabs when navigating to project detail pages
  - Restore last active project route on app startup
- Resource management
  - Add resources by file picker dialog or drag and drop
  - Manage resources per project
  - Delete resources, with optional native file deletion
  - Mark resource status as `used` or `unused`
  - Edit resource tags and filter by tags/status
  - Multi-select resources and drag selected files out of the app
- Project list UX
  - Grid/list view toggle
  - Search projects by title, description, and tags
  - Create a project directly from dropped files
- Desktop integrations (IPC)
  - Open native file picker
  - Reveal file location in Finder
  - Delete native files from disk
  - Native drag-out support via `webContents.startDrag`

## Tech Stack

- Electron 30
- Vite 5
- React 18 + TypeScript 5
- TanStack Router (file-based routes)
- TanStack React Query + react-query-kit
- Zustand (persisted UI state)
- IndexedDB (`idb`)
- Tailwind CSS 4 + Radix UI primitives

## Project Structure

```text
electron/
  main.ts        # Electron main process + IPC handlers
  preload.ts     # Context bridge for renderer
src/
  routes/        # File-based routing
  features/
    project-list/
    project-detail/
  services/      # Query/mutation service layers
  lib/db.ts      # IndexedDB data access
  stores/        # Persisted UI/session state
```

## Data Model

- `ProjectEntity`
  - `id`, `createdAt`, `updatedAt`
  - `title`, `description`, `resourcesCount`, `tags`
- `MaterialEntity`
  - `id`, `createdAt`, `updatedAt`
  - `projectId`, `name`, `path`, `size`, `alias`, `status`, `tags`

Notes:
- Data is stored in IndexedDB database `video-manager-db`.
- Current DB schema version is `3`.
- Migration in v3 backfills missing material `status` with `unused`.

## Development

Install dependencies:

```bash
pnpm install
```

Start app in development mode:

```bash
pnpm dev
```

Build app:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Preview renderer build:

```bash
pnpm preview
```

## Routing

- `/` project list
- `/projects/` project list
- `/projects/$id` project detail

Root layout includes top tabs for opened projects and per-route content rendering.

## Notes

- App state such as opened project tabs and list/search preferences is persisted with Zustand.
- Query invalidation is tag-based via custom React Query metadata in `src/queryClient.ts`.
