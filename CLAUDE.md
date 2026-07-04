# CLAUDE.md

- Use `grill-me` skill first when planning
- Use **pnpm** for all package management (not npm/yarn).
- Use `zustand` for local settings (in `src/stores`)
- See [src/routeTree.gen.ts](src/routeTree.gen.ts) for the auto-generated route tree.
- **DO NOT** edit [src/routeTree.gen.ts](src/routeTree.gen.ts)

## Git guidelines

- Format:
  ```
  <type>(<scope>): <description>
  <optional body>
  ```
  - **type**: feat, fix, chore, refactor
  - **scope**: path based, as complete as possible
  - Add body if possible
- **DO NOT** commit any code without user's permission
- **DO NOT** add `Co-Authored-By:*`
- Commit changes seperated by scope if possible
