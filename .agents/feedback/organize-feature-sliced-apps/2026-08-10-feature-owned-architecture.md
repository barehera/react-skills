---
feedback_version: 1
target_skill: feature-sliced-design
target_skill_version: unversioned
source_project: react-skills-user-architecture-conventions
captured_at: 2026-08-10
status: ready
---

# Skill Feedback: feature-sliced-design

## Executive Summary

The user requested a reusable React architecture skill for large applications
that keeps business code under `features/<feature>`, retains a small set of
project-wide foundations, supports SSR and server actions, separates client and
server third-party initialization, and never creates barrel exports. The
accepted direction adapts Feature-Sliced Design to this repository's direct
import contract instead of copying either a flat technical-folder layout or the
official `index.ts` convention literally.

## Project Context

- Task: create a new React Skills catalog item for designing, migrating, and
  reviewing feature-sliced application structure.
- Stack and conventions: React, TypeScript, optional Next.js App Router,
  shadcn/Radix, React Hook Form, Zod, scoped Zustand, TanStack Query, Axios,
  direct imports, and no re-export-only barrels.
- Skill invocation: the user described the desired root and feature folders
  and asked for a senior-level refinement based on current FSD guidance.
- Evidence reviewed: the user's folder list and placement preferences;
  `docs/technology-stack.md`; `docs/adding-a-skill.md`; the complete
  `manage-server-state` skill and example; and the official FSD layers,
  slices/segments, public API, migration, and Next.js guidance.

## Findings

### F-001: Organize by ownership before technical category

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

The proposed application root contains `components`, `hooks`, `schemas`,
`types`, `constants`, and `utils`. These folders become ambiguous as the number
of features and contributors grows.

#### Evidence

Direct user feedback listed these folders as project-wide defaults. Official
FSD guidance says segments such as `components`, `hooks`, and `types` describe
what a file is rather than what it is for, and its migration guide recommends
moving feature-owned code out of global technical buckets.

#### Current behavior

No catalog skill owns the decision of whether a file belongs to an application
boundary, a business slice, or a shared foundation.

#### Preferred behavior

Choose the owner first, then the purpose. Keep business artifacts in their
feature, entity, page, or widget slice. Keep only genuinely cross-feature,
business-agnostic foundations in `shared` and app-wide composition in `app`.

#### Proposed skill change

Add a core ownership test and a placement reference that maps every proposed
root folder to the refined destination.

#### Generalization test

Apply to growing React applications and migrations. Preserve a coherent
existing architecture during scoped feature work, and do not force FSD onto a
small application that has no maintainability problem.

#### Acceptance criteria

- The skill rejects empty or speculative global technical buckets.
- The placement guide gives an actionable destination for every proposed root.

### F-002: Keep complete business capabilities inside feature slices

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

The user expects capabilities such as authentication, consent, jobs, and
announcements to own their related API, components, hooks, schemas, state, and
utilities.

#### Evidence

Direct user feedback explicitly requires feature-related files to remain in the
feature folder. Official FSD guidance defines slices as cohesive business
groups and permits purpose-based segments such as `ui`, `api`, `model`, `lib`,
and `config`.

#### Current behavior

Existing catalog skills place some artifacts in features, but no skill defines
the whole-slice ownership rule or guards against sibling-feature imports.

#### Preferred behavior

Let a feature own all code that changes for that capability. Create only the
segments it needs, prefer purpose names, and prohibit direct imports between
sibling feature slices.

#### Proposed skill change

Define a feature-slice contract, a dependency direction, and a canonical
feature-first example.

#### Generalization test

Apply to user-valued interactions. Keep reusable business nouns in `entities`,
large compositions in `widgets` or pages, and generic UI in `shared/ui`.

#### Acceptance criteria

- A feature can be changed or deleted without searching global buckets.
- Same-layer feature-to-feature imports are identified as violations.

### F-003: Colocate remote state with its business owner

- Category: ambiguous-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

The user commonly has a root `server-state` folder and does not want a
duplicative root API layer, while feature folders may also contain
`server-state` and `api`.

#### Evidence

The user stated this preference directly. The `manage-server-state` skill
defaults to feature-colocated TanStack Query code and keeps only project-wide
transport/query primitives in a shared location.

#### Current behavior

Without an ownership rule, resource queries can drift to a global
`server-state/<resource>` tree while their UI, schemas, and mutations live in a
feature.

#### Preferred behavior

Put query keys, options, hooks, mutations, and cache effects in the owning
feature's `server-state` segment. Keep QueryClient setup, transport, error
normalization, and proven multi-feature primitives in app/shared boundaries.
Use `api` for raw backend interaction or server actions, not as a second copy
of Query state.

#### Proposed skill change

Add an explicit server-state/API responsibility table and route implementation
details to `$manage-server-state`.

#### Generalization test

Allow entity-owned reads when several features consume the same business
entity, and preserve an established resource-first server-state architecture
unless the user requests migration.

#### Acceptance criteria

- Feature queries do not depend on a global resource dump.
- Raw transport and TanStack Query responsibilities have one owner each.

### F-004: Treat third-party SDKs as runtime-specific integrations

- Category: missing-rule
- Severity: high
- Recurrence: repeated
- Confidence: high

#### Scenario

The user keeps analytics and Firebase initialization under `libs`, including
client and server app setup, Remote Config defaults, and exported getters.

#### Evidence

The user supplied the Firebase file pattern and analytics examples. Official
FSD guidance places external-world connections and contained libraries in
Shared, while Next.js guidance warns against mixing server-only exports into a
client module graph.

#### Current behavior

The name `libs` does not distinguish internal libraries from vendor adapters,
and one `index.ts` can accidentally combine client and server modules.

#### Preferred behavior

Use `shared/integrations/<vendor>` for vendor initialization and adapters.
Separate `client`, `server`, and static config modules; expose stable direct
runtime-specific paths; initialize app-wide analytics from the app boundary.

#### Proposed skill change

Add a detailed Firebase/analytics placement example and environment-boundary
rules.

#### Generalization test

Apply to SDK initialization and thin adapters. Keep business workflows that use
an SDK in their feature, and keep focused internal libraries under
`shared/lib/<purpose>`.

#### Acceptance criteria

- Client code cannot import a module that initializes server credentials.
- Vendor integration folders contain no feature-specific business workflow.

### F-005: Preserve slice contracts without barrel exports

- Category: project-convention
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

Official FSD usually expresses slice public APIs with `index.ts`, but the user
and this repository explicitly prohibit barrel exports.

#### Evidence

The user said “never do barrel export.” `docs/technology-stack.md` requires
direct imports and forbids re-export-only barrels. Official FSD public API
guidance also documents circular-import and tree-shaking risks of index files.

#### Current behavior

Applying FSD mechanically would conflict with the repository's canonical
examples and the user's import policy.

#### Preferred behavior

Define a slice's public contract as stable, documented direct module paths.
Place real entry implementations at those paths, use full relative imports
inside the slice and aliased imports across slices, and forbid `export *` plus
re-export-only files. An `index.ts` may exist only when it owns implementation.

#### Proposed skill change

Adapt the public API rule throughout the skill and its example rather than
adding a special exception note.

#### Generalization test

Use strict index-based APIs only in a consuming repository that already relies
on them and explicitly requests preservation. New React Skills examples remain
direct-import based.

#### Acceptance criteria

- The canonical example has no re-export-only file.
- External consumers use stable paths without importing private internals.

### F-006: Keep framework-owned roots thin and explicit

- Category: missing-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

The proposed root includes `app`, `api`, `public`, and scripts, and the user
wants SSR functions and actions when necessary.

#### Evidence

Official FSD Next.js guidance recommends keeping framework `app`/`pages` at the
project root and renaming conflicting FSD layers to `_app`/`_pages`. It treats
route handlers as framework adapters and recommends separating large backend
surfaces into another package.

#### Current behavior

Framework route folders can accumulate business logic and become a parallel
architecture.

#### Preferred behavior

Keep route files, metadata, layouts, loading/error boundaries, and route
handlers in framework-mandated roots, but delegate business UI and actions to
the appropriate source slice. Keep `public` for URL-served static files and
root `scripts` for repository automation only.

#### Proposed skill change

Add a Next.js adaptation and route/action placement guide.

#### Generalization test

For Vite or another router, use the normal `src/app` FSD layer without
underscore renaming. Do not create Next.js-specific folders in other stacks.

#### Acceptance criteria

- Route entries remain thin adapters.
- Server-only modules cannot leak into client imports.

### F-007: Migrate incrementally and create folders on demand

- Category: missing-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

The user listed a large starting skeleton and allowed for additional folders.

#### Evidence

Official FSD guidance says not every layer is required and recommends
incremental migration. The neighboring server-state skill likewise creates
only files with real responsibilities.

#### Current behavior

A diagram-first migration can create empty layers and move many unrelated files
without reducing coupling.

#### Preferred behavior

Profile the current repository, choose the smallest target architecture, move
one vertical slice at a time, update imports and validation, then extract shared
code only after reuse is proven.

#### Proposed skill change

Add create/refactor/audit workflows plus migration and review checklists.

#### Generalization test

Use a complete target architecture for a new large application, but still omit
unused layers and segments.

#### Acceptance criteria

- The skill never creates empty placeholder folders.
- Scoped work does not silently migrate unrelated code.

## Cross-Cutting Decisions

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | core contract + placement reference | ownership is the primary maintainability rule | example tree + repository validation |
| F-002 | accepted | slice/import reference | feature cohesion is the user's central goal | example review |
| F-003 | adapted | runtime reference + companion routing | preserve custom `server-state` while separating raw API concerns | cross-check with `manage-server-state` |
| F-004 | accepted | runtime reference | client/server SDK separation is correctness-critical | Firebase placement example |
| F-005 | adapted | core contract + direct-import reference | preserve FSD contracts without violating repository policy | no-barrel review |
| F-006 | accepted | framework reference | framework roots are real constraints, not architecture layers | Next.js example |
| F-007 | accepted | workflow + migration reference | avoids speculative skeletons and risky rewrites | audit checklist |

The catalog term is **feature-sliced** for the architecture and **feature
slice** for a business capability folder. Use `shared`, not `common`, for the
lowest reusable layer. Use singular `lib` only for focused internal libraries
and `integrations` for vendor SDK boundaries.

## Validation Requested

- Run `node skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs`
  on this report.
- Run the official skill quick validator on the new skill.
- Run `npm run validate` for the complete catalog and registry build.
- Forward-test the skill against one greenfield layout request and one legacy
  flat-folder migration request without exposing the intended placement map.
