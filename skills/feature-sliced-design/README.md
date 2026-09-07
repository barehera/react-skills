# Feature-Sliced Design

[← React Skills catalog](../../README.md)

Design, migrate, or audit large React applications around clear feature
ownership, downward dependencies, stable direct imports, and explicit
framework/client/server boundaries.

The shared `.agents/skills/VERSION` file records the single React Skills
repository release that supplied the installed workflow.

This skill refines common flat roots such as `components`, `hooks`, `schemas`,
`types`, `utils`, `libs`, `server-state`, and `store` into feature, entity,
page, widget, app, and focused Shared owners. It adapts official
Feature-Sliced Design to the catalog's no-re-export-barrel convention.

## Install

Choose it from the interactive React Skills catalog:

```bash
npx --yes github:barehera/react-skills
```

Use the arrow keys to move, `Space` to select, `a` to toggle all, and `Enter`
to install.

Or install it directly:

```bash
npx shadcn@latest add barehera/react-skills/feature-sliced-design
```

The canonical instructions are installed at:

```text
.agents/skills/feature-sliced-design/SKILL.md
```

## Use

```text
Use $feature-sliced-design to design the folder architecture for this
new Next.js application. Keep framework routes thin, feature code cohesive,
client and server integrations separate, and use no barrel exports.
```

```text
Use $feature-sliced-design to place this new subscription-management
feature. Inspect the repository first and tell me where each UI, schema,
Server Action, TanStack Query mutation, flag, and test belongs before editing.
```

```text
Use $feature-sliced-design to audit our components, hooks, utils, types,
server-state, and libs folders. Do not edit files. Report misplaced ownership,
same-layer imports, runtime leaks, barrels, and a safe migration order.
```

The skill inspects the current application before recommending a target. It
creates only folders with real responsibilities and migrates one vertical slice
at a time instead of forcing a big-bang rewrite.

## Guidance

- [Architecture and folder placement](references/architecture-and-placement.md)
- [Feature slices, imports, and direct public paths](references/slices-and-imports.md)
- [Next.js, SSR, Server Actions, server state, and integrations](references/framework-and-runtime-boundaries.md)
- [Creation, migration, audit, and review workflow](references/migration-and-review.md)
- [Canonical Next.js App Router example](examples/next-app-router/README.md)

Use `$manage-server-state` for the internals of Axios/TanStack Query code,
`$build-forms` for React Hook Form and Zod form behavior, and
`$build-composable-components` for shadcn/Radix component architecture.

## Update

```bash
npx shadcn@latest add barehera/react-skills/feature-sliced-design --overwrite
```

Check the installed version:

```powershell
Get-Content .agents\skills\VERSION
```
