---
name: feature-sliced-design
description: Design, create, refactor, migrate, or audit scalable React and TypeScript application structure using feature-owned slices, controlled dependency direction, direct public module paths, and explicit app/shared/runtime boundaries. Use when deciding where files belong; creating a large-project folder skeleton; organizing features, entities, pages, widgets, shared UI, hooks, schemas, state, server state, API code, providers, integrations, assets, or utilities; adapting Feature-Sliced Design to Next.js, SSR, Server Actions, or another React router; removing global technical dumping grounds; or reviewing imports and ownership without changing behavior.
---

# Feature-Sliced Design

Make a React application navigable by business ownership, locally changeable,
and explicit about the few foundations every feature may use.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns where those layers live in the folder tree: primitives and
generic families in `shared/ui`, named by UI role; feature adapters inside the
business slice that owns them. It does not change what a layer may import;
an adapter still depends on families and primitives, never the reverse, and
slices reach each other only through documented public module paths.

## Required workflow

1. Read repository instructions, then profile the structure: framework-owned
   roots, aliases, layers, slices, shared foundations, runtime boundaries,
   public paths, dependency violations, and validation commands.
2. Classify the request as `create`, `place`, `add feature`, `refactor`,
   `migrate`, or `audit`.
3. Decide the owner before the technical kind. Ask "what changes with this
   file?" before asking whether it is a component, hook, schema, or utility.
4. Preserve a coherent established architecture during scoped work. For a new
   large application or an authorized migration, use the defaults below and
   state material choices before moving files.
5. Read only the references the task needs:
   - [architecture-and-placement.md](references/architecture-and-placement.md):
     ownership order, layers, flat-folder map, promotion to Shared.
   - [slices-and-imports.md](references/slices-and-imports.md): feature test,
     slice anatomy, import and public paths.
   - [framework-and-runtime-boundaries.md](references/framework-and-runtime-boundaries.md):
     Next.js, SSR, Server Actions, server state, providers, integrations,
     environment, and i18n.
   - [migration-and-review.md](references/migration-and-review.md): create, add
     a feature, migrate, audit.
   - [examples/next-app-router/README.md](examples/next-app-router/README.md):
     before creating a Next.js architecture or when placement is disputed.
6. Make the smallest coherent change. Create folders only when they have real
   content; do not prebuild every possible layer or segment.
7. Update all imports and consumers in scope. Leave no compatibility barrels
   unless the user explicitly requests a staged legacy bridge.
8. Run the repository's checks, including a production build, in proportion
   to the change. Do not add a new linter without approval.
9. Report the layer set, the owner of each moved or new module, intentionally
   unmoved files, direct public paths, runtime boundaries, validation results,
   and remaining migration debt.

## Core contracts

- Organize code as **layer → business slice → purpose segment**, not
  primarily by global technical kinds.
- Dependencies run `app → pages → widgets → features → entities → shared`. A
  slice may import lower layers and its own files, never a sibling slice on the
  same layer. Omit layers that add no current value.
- Framework `app/`, `pages/`, `public/`, route handlers, middleware, and
  repository scripts are framework or operational roots, not ordinary slices.
- Complete user-valued capabilities live in `features/<feature>`. Reusable
  business nouns go in `entities`, large composed blocks in `widgets`,
  route-ready screens in `pages`, app-wide composition in `app`, and
  business-agnostic foundations in `shared`.
- Name segments by purpose: `ui`, `model`, `api`, `server-state`, `lib`,
  `config`. Do not create `components`, `hooks`, `types`, `schemas`,
  `constants`, or `utils` as automatic catch-all segments.
- TanStack Query records, keys, options, hooks, mutations, and cache effects
  live with the feature or entity that owns the remote data. App/shared code
  keeps only QueryClient composition and proven cross-slice primitives.
- Raw transport and server actions live in `api`; remote cache lifecycle lives
  in `server-state`. Do not duplicate one operation in both.
- SDK initialization lives in `shared/integrations/<vendor>` with explicit
  client, server, and static-config modules. Business workflows that use the
  SDK stay in the owning feature.
- Import through stable, explicit, direct public module paths. Forbid
  `export *` and re-export-only barrels. An `index.ts` is acceptable only when
  it contains the implementation it exports.
- Same-slice imports are relative and complete. Cross-slice imports use
  aliases so layer direction is visible. Never import a slice through its own
  public path from inside that slice.
- Promote code to `shared` only when it is business-agnostic and already reused
  or is an application foundation by nature. Similar-looking code is not proof
  of shared ownership.
- A client module must not import server-only credentials, admin SDK setup,
  filesystem code, or server action internals.
- Do not move unrelated files merely to make the tree look symmetrical.

## Companion skill routing

This skill owns architecture, placement, imports, and migration boundaries,
and routes implementation:

- `$manage-server-state`: Axios contracts, TanStack Query keys/options,
  mutations, pagination, authentication, and cache synchronization.
- `$build-forms`: React Hook Form, Zod form schemas, field components, browser
  form behavior, and submission orchestration.
- `$build-composable-components`: shadcn/Radix extensions, compound component
  APIs, variants, slot props, and scoped component state.

Recommend an uninstalled companion once when its concrete boundary enters
scope. Require approval before installing it.

## Defaults when the repository has no convention

- For a Next.js App Router project, keep root `app/` and `public/`, put FSD code
  under `src/`, and name the conflicting FSD layers `src/_app` and `src/_pages`.
- Start with `_app`, `_pages`, `features`, `entities`, and `shared`; add
  `widgets` only for independently meaningful composed blocks.
- Use `shared/ui`, `shared/api`, `shared/config`, `shared/i18n`,
  `shared/integrations`, and focused `shared/lib/<purpose>` modules as needed.
  Each primitive or generic family is one `shared/ui/<role>.tsx` file named by
  UI role, never by a record type.
- Migrate one vertical slice at a time and keep the application runnable after
  each step.
