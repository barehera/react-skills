---
name: feature-sliced-design
description: Design, create, refactor, migrate, or audit scalable React and TypeScript application structure using feature-owned slices, controlled dependency direction, direct public module paths, and explicit app/shared/runtime boundaries. Use when deciding where files belong; creating a large-project folder skeleton; organizing features, entities, pages, widgets, shared UI, hooks, schemas, state, server state, API code, providers, integrations, assets, or utilities; adapting Feature-Sliced Design to Next.js, SSR, Server Actions, or another React router; removing global technical dumping grounds; or reviewing imports and ownership without changing behavior.
---

# Feature-Sliced Design

Make a React application navigable by business ownership, locally changeable,
and explicit about the few foundations that every feature may use.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.
This shared file is the repository release version for every installed React
Skills workflow; this skill has no independent version.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns where those layers live in the folder tree: primitives and
generic families under the shared foundation, feature adapters inside the
business slice that owns them. It does not change what a layer may import;
an adapter still depends on families and primitives, never the reverse, and
slices reach each other only through documented public module paths.

## Required workflow

1. Read repository instructions and inspect the framework, source roots,
   aliases, route roots, package boundaries, existing imports, neighboring
   features, state setup, transport, providers, and validation commands.
2. Classify the request as `create`, `place`, `add feature`, `refactor`,
   `migrate`, or `audit`.
3. Build a short architecture profile: framework-owned roots, current layers,
   business slices, shared foundations, runtime boundaries, direct public
   paths, dependency violations, and migration constraints.
4. Decide the owner before the technical kind. Ask “what changes with this
   file?” before asking whether it is a component, hook, schema, or utility.
5. Preserve a coherent established architecture during scoped work. For a new
   large application or an authorized migration, use the defaults below and
   state material choices before moving files.
6. Read only the focused references needed for the task:
   - [architecture-and-placement.md](references/architecture-and-placement.md)
     for layers, ownership tests, and mapping common root folders.
   - [slices-and-imports.md](references/slices-and-imports.md) for feature
     anatomy, dependency direction, direct public paths, and no-barrel rules.
   - [framework-and-runtime-boundaries.md](references/framework-and-runtime-boundaries.md)
     for Next.js, SSR, Server Actions, server state, Axios, analytics, Firebase,
     environment config, and client/server separation.
   - [migration-and-review.md](references/migration-and-review.md) for
     greenfield creation, incremental migration, audits, and acceptance checks.
   - [examples/next-app-router/README.md](examples/next-app-router/README.md)
     before creating a new Next.js architecture or when placement is disputed.
7. Make the smallest coherent change. Create folders only when they have real
   content; do not prebuild every possible layer or segment.
8. Update all imports and consumers in scope. Do not leave compatibility
   barrels behind unless the user explicitly requests a staged legacy bridge.
9. Run formatting, lint, typecheck, tests, architecture checks, and a production
   build in proportion to the change. Do not add a new linter without approval.
10. Report the selected structure, moved and intentionally unmoved files,
    dependency rules, direct public paths, runtime boundaries, validation, and
    remaining migration debt.

## Core contracts

- Organize code in this order: **layer → business slice → purpose segment**.
  Do not organize a large application primarily by global technical kinds.
- Use the dependency direction `app → pages → widgets → features → entities →
  shared`. Omit layers that add no current value. A slice may import lower
  layers and its own files, never a sibling slice on the same layer.
- Treat framework `app/`, `pages/`, `public/`, route handlers, middleware, and
  repository scripts as framework or operational roots, not ordinary slices.
- Keep complete user-valued capabilities in `features/<feature>`. Put reusable
  business nouns in `entities`, large composed blocks in `widgets`, route-ready
  screens in `pages`, app-wide composition in `app`, and business-agnostic
  foundations in `shared`.
- Name segments by purpose. Prefer `ui`, `model`, `api`, `server-state`, `lib`,
  and `config`; do not create `components`, `hooks`, `types`, `schemas`,
  `constants`, or `utils` as automatic catch-all segments.
- Keep TanStack Query records, keys, options, hooks, mutations, and cache
  effects with the feature or entity that owns the remote data. Keep only
  QueryClient composition and proven cross-slice primitives in app/shared code.
- Keep raw transport and server actions in `api`; keep remote cache lifecycle in
  `server-state`. Do not duplicate the same operation in both boundaries.
- Put SDK initialization in `shared/integrations/<vendor>` with explicit
  client, server, and static-config modules. Keep business workflows that use
  the SDK in the owning feature.
- Use direct imports and stable, explicit public module paths. Forbid `export *`
  and re-export-only barrels. An `index.ts` is acceptable only when it contains
  the implementation it exports.
- Keep internal same-slice imports relative and complete. Use aliases across
  slices so layer direction is visible. Never import a slice through its own
  public path from inside that slice.
- Promote code to `shared` only when it is business-agnostic and already reused
  or is an application foundation by nature. Similar-looking code is not proof
  of shared ownership.
- Preserve environment boundaries. A client module must not import server-only
  credentials, admin SDK setup, filesystem code, or server action internals.
- Do not move unrelated files merely to make the tree look symmetrical.

## Companion skill routing

This skill owns architecture, placement, imports, and migration boundaries. It
does not duplicate implementation guidance owned elsewhere:

- Use `$manage-server-state` for Axios contracts, TanStack Query keys/options,
  mutations, pagination, authentication, and cache synchronization.
- Use `$build-forms` for React Hook Form, Zod form schemas, field components,
  browser form behavior, and submission orchestration.
- Use `$build-composable-components` for shadcn/Radix extensions, compound
  component APIs, variants, slot props, and scoped component state.

Recommend an uninstalled companion once when its concrete boundary enters
scope. Require approval before installing it.

## Defaults when the repository has no convention

- For a Next.js App Router project, keep root `app/` and `public/`, put FSD code
  under `src/`, and name conflicting FSD layers `src/_app` and `src/_pages`.
- Start with `_app`, `_pages`, `features`, `entities`, and `shared`; add
  `widgets` only for independently meaningful composed blocks.
- Use `shared/ui`, `shared/api`, `shared/config`, `shared/i18n`,
  `shared/integrations`, and focused `shared/lib/<purpose>` modules as needed.
- Put feature-specific UI, model/schema/store logic, transport/actions,
  server-state adapters, policies, and configuration in that feature.
- Define a slice's external contract with real implementation modules at stable
  direct paths and document or lint the allowed paths. Keep private supporting
  modules below purpose segments.
- Migrate one vertical slice at a time and keep the application runnable after
  each step.
