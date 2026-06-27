# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Electron dev server with Vite HMR
pnpm build        # TypeScript check → Vite build → electron-rebuild → electron-builder
pnpm lint         # ESLint on src/ and electron/ (zero warnings policy)
pnpm preview      # Preview the Vite renderer build
pnpm rebuild      # Electron native dependency rebuild only
```

- Use **pnpm** for all package management (not npm/yarn).
- Node version: 22.21.0 (see `.nvmrc`).

## Architecture

### Electron app with Vite + React

The project is an **Electron desktop app** that manages video/media resources organized by projects. Data is persisted locally in IndexedDB — there is no backend server.

**Process boundary:**

- [electron/main.ts](electron/main.ts) — Main process: creates the BrowserWindow, registers `ipcMain.handle` / `ipcMain.on` handlers for native file dialogs, file deletion, drag-out, and "show in folder".
- [electron/preload.ts](electron/preload.ts) — Preload: exposes `ipcRenderer.invoke`, `send`, `on`, `off` on `window.ipcRenderer` via `contextBridge.exposeInMainWorld`.
- Renderer process: React app under [src/](src/). IPC calls go through the `db` object in [src/lib/db.ts](src/lib/db.ts) (methods like `db.deleteNativeFile`, `db.addMaterialDialog`, `db.openFileLocation`, `db.startDrag`).

### Data layer

**Data model** defined in [src/typings.ts](src/typings.ts):

- `ProjectEntity` — `id`, `createdAt`, `updatedAt`, `title`, `description`, `resourcesCount`, `tags[]`
- `MaterialEntity` — `id`, `createdAt`, `updatedAt`, `projectId`, `name`, `path`, `size`, `status` (`'used'|'unused'`), `tags[]`

All direct IndexedDB access is in [src/lib/db.ts](src/lib/db.ts). Uses the `idb` library. Schema version is currently 3 (increment on changes). The `db` object is a flat bag of async functions — callers do `db.getProjects()`, `db.saveProject(...)`, etc.

**Service layer** in [src/services/](src/services/):

- [src/services/projects.ts](src/services/projects.ts) — wraps `db` calls into `react-query-kit` `router` queries/mutations
- [src/services/resources.ts](src/services/resources.ts) — same pattern for materials/resources

**Query client** in [src/queryClient.ts](src/queryClient.ts):

- `retry: false` globally (queries and mutations).
- Tag-based cache invalidation: mutations declare `meta.invalidatesTags` (e.g. `["Projects"]`, `["Resources"]`); on success, matching queries are invalidated. Queries declare `meta.tags` to opt into this.

### State management (Zustand)

Two persisted stores (both use `zustand/middleware` `persist` + `combine`):

- [src/stores/settings.ts](src/stores/settings.ts) — `projectListType` (grid/list), `searchQuery`, `activeProjectId`. Exports both hooks (`useProjectListType()`, `useSearchQuery()`) and getter/setter functions for non-React use (`getActiveProjectId()`, `setActiveProjectId()`).
- [src/stores/opened-projects.ts](src/stores/opened-projects.ts) — tracks opened project tab IDs. Exported as hooks + imperative `addOpenedId`/`deleteOpenedId` functions (called from route `beforeLoad` lifecycle).

### Routing (TanStack Router, file-based)

- Route tree auto-generated at [src/routeTree.gen.ts](src/routeTree.gen.ts) by `@tanstack/router-plugin/vite` — do not edit by hand.
- Uses `createMemoryHistory` (Electron-friendly, no browser URL bar).
- On startup, restores last active project from settings store ([src/main.tsx:14-15](src/main.tsx#L14-L15)).
- [src/routes/\_\_root.tsx](src/routes/__root.tsx) — root layout with `SidebarProvider`, `<AppSidebar />`, `<AppTabs />`, sonner `<Toaster />`, and `<Outlet />`.
- Routes:
  - `/` — project list (`beforeLoad` clears active project)
  - `/projects/` — project list (legacy alias)
  - `/projects/$id` — project detail (`beforeLoad` saves opened tab and active project)

### Feature modules

- [src/features/project-list/](src/features/project-list/) — project list page: search, grid/list toggle, drop zone for creating projects from files, thumbnails, loading skeletons, empty states
- [src/features/project-detail/](src/features/project-detail/) — project detail page: resource grid, add/delete/edit resources, status toggling, tag editing, multi-select + drag-out, video preview with time-coded tagging

### UI

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, not PostCSS).
- shadcn/ui components in [src/components/ui/](src/components/ui/) (New York style, CSS variables).
- Icons from lucide-react.
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`).
- Design system documented in [DESIGN.md](DESIGN.md) — "Warm Studio" light theme with amber accent.

### Drag and drop

[src/lib/drag-state.ts](src/lib/drag-state.ts) holds a mutable `dragState` object used to distinguish internal drags (within the app) from external ones. The native drag-out IPC channel is `app:start-drag`.

## Coding conventions

### Imports
- Use `@/` path alias for all source imports (maps to `src/`).
- Group imports: React/external libraries → TanStack Router → local services/stores → components → utils.

### Components
- Feature components in `src/features/<name>/`. Shared UI in `src/components/ui/`.
- Use `cn()` from [src/lib/utils.ts](src/lib/utils.ts) (`clsx` + `tailwind-merge`) for conditional Tailwind classes.
- Named exports for components, not default exports.

### Styles
- Never use hardcoded Tailwind color classes like `text-gray-500`, `bg-blue-600`, `bg-white`. Use CSS variable references: `text-muted-foreground`, `bg-primary`, `bg-card`.
- The theme is light-only with warm tones. No `dark:` variants needed.
- Prefer `border-border` (via CSS variable) over explicit border colors.

### Mutations & cache
- Mutations use `react-query-kit` `router.mutation`. `meta.invalidatesTags` controls cache invalidation.
- Always add `onSuccess`/`onError` with toasts for user-visible mutations:
  ```tsx
  const { mutate } = resources.save.useMutation({
    onSuccess: () => toast.success("Resources added"),
    onError: () => toast.error("Failed to add resources"),
  });
  ```
- For mutations that need the updated data freshest, destructure `queryClient` and call `queryClient.invalidateQueries()` directly.
