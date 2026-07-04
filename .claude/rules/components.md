---
description: This file describes the component code style for the project.
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

- Feature components in `src/features/<name>/`. Shared UI in `src/components/ui/`.
- Use `cn()` from `src/lib/utils.ts` (`clsx` + `tailwind-merge`) for conditional Tailwind classes.
- Named exports for components, not default exports.
