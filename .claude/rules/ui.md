---
description: This file describes the UI code style for the project.
paths:
  - "src/**/*.css"
  - "src/**/*.tsx"
---

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, not PostCSS).
- shadcn/ui components in [src/components/ui/](./../../src/components/ui/) (New York style, CSS variables).
- Icons from lucide-react.
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`).
- Design system documented in [DESIGN.md](./../../DESIGN.md) — "Warm Studio" light theme with amber accent.
- **NEVER** use hardcoded Tailwind color classes like `text-gray-500`, `bg-blue-600`, `bg-white`. Use CSS variable references: `text-muted-foreground`, `bg-primary`, `bg-card`.
- The theme is light-only with warm tones. No `dark:` variants needed.
- Prefer `border-border` (via CSS variable) over explicit border colors.
