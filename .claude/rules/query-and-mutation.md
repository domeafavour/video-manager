---
description: This file describes the query and mutation code style for the project.
paths:
  - "src/services/*.ts"
---

- Use `react-query-kit` for queries and mutations. 
- Tag-based cache invalidation: mutations declare `meta.invalidatesTags` (e.g. `["Projects"]`, `["Resources"]`); on success, matching queries are invalidated. Queries declare `meta.tags` to opt into this.
- Always add `onSuccess`/`onError` with toasts for user-visible mutations:
  ```tsx
  const { mutate } = resources.save.useMutation({
    onSuccess: () => toast.success("Resources added"),
    onError: () => toast.error("Failed to add resources"),
  });
  ```
