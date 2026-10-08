# Architecture and placement

This skill follows the official Feature-Sliced Design layers, slices, and
segments, but adapts its usual `index.ts` public API to the React Skills
direct-import and no-re-export-barrel contract.

## Ownership model

Choose the first true statement:

1. **Framework or tool requires the path**: keep it at the required root, such
   as Next.js `app/`, `pages/`, `public/`, `middleware.ts`,
   `instrumentation.ts`, generated code, repository `scripts/`, or package
   configuration.
2. **The whole application composes it**: app layer (startup, providers, router
   setup, global store composition, global styles, analytics bootstrapping,
   error boundaries), never feature workflows or reusable UI primitives.
3. **A route or screen owns it**: page slice, including route-local
   loading/error composition, but not reusable feature internals.
4. **A large self-sufficient UI/data block reused across pages owns it**:
   widget slice; not every page section by default.
5. **A user-valued interaction owns it**: feature slice, with all artifacts
   that change with it; not generic primitives or stable business nouns used
   independently.
6. **A reusable business noun owns it**: entity slice, with its
   representations, contracts, and entity-owned reads; not multi-entity
   workflows.
7. **It is business-agnostic foundation code**: a focused Shared segment; never
   a product feature hidden behind a generic name.

Then choose the segment by purpose: `ui`, `model`, `api`, `server-state`, `lib`,
`config`, or an app/shared purpose such as `providers`, `i18n`, or
`integrations`.

Break ties by change coupling: files usually changed together stay together, so
deleting a feature removes its UI, schemas, state, queries, tests, flags, and
policies without hunting across project-wide technical folders.

Do not use the deprecated `processes` layer. Coordinate multi-page flows from
app routing or a focused feature unless the application has a proven
alternative.

## Map common root folders

When refactoring a flat `src` tree, the destination is a default, not
permission to move unrelated code during a scoped task.

| Existing folder | Destination and rule |
| --- | --- |
| `api` | transport/generated client infrastructure in `shared/api`; endpoint adapters/actions in owner `api`; Next route files stay under framework `app/api` |
| `app` | distinguish the Next.js routing root from the FSD app layer (`src/_app` or `src/app`) |
| `assets`, `public` | imported/bundled assets in `shared/assets` or the owner; only static files served without importing in root `public`; never both |
| `components` | business UI in owner `ui`; only business-agnostic primitives and families in `shared/ui` |
| `config`, `constants` | owner `config` or `model` beside the policy they configure, app config, or `shared/config/<purpose>` (environment, routes, flags); no global constants catalog |
| `env` | `shared/config/env`, typed by runtime; no secrets in client modules |
| `features` | `features/<feature>`, one cohesive user-valued interaction each, not a synonym for every business noun |
| `hooks` | owner `model`, `ui`, `server-state`, or focused `shared/lib`, by what the hook coordinates |
| `libs` | contained internal libraries in `shared/lib/<purpose>`; SDK/vendor boundaries in `shared/integrations/<vendor>` |
| `locales` | global setup and shared strings in `shared/i18n`; feature copy follows the feature |
| `providers` | app `providers`; provider-specific helpers stay with their owner |
| `schemas`, `types` | beside the owning contract, at the trust boundary or domain (`model` or `api`); infer types when the schema is authoritative; global types only for truly cross-domain foundations such as branding utilities |
| `scripts` | root `scripts`, outside runtime source; fix misspellings such as `scriipts` |
| `server-state` | owner `server-state`; app/shared only for primitives; no global resource dump |
| `store` | app-wide store composition and store creation helpers in app/shared; scoped Zustand stores in the owner's `model`; remote records stay in TanStack Query, never mirrored into Zustand |
| `utils` | owner `lib` or `shared/lib/<purpose>`, named by capability such as `date`, `text`, or `currency`; no miscellaneous utils bucket |

Other folders are allowed when their purpose and ownership are clearer than
these defaults. Do not add a top-level layer merely because one team has a
local category name.

## Decide whether code is shared

Promote code only when every applicable check passes:

- It encodes no product workflow, feature flag, or business-specific branching
  behind a generic name.
- At least two independent owners use it, or it is foundational by nature
  (HTTP client, environment parsing, design-system primitive, i18n setup).
- Its API can stay stable while either consumer changes.
- Moving it lower creates no upward dependency or import cycle.
- The shared module has one named purpose and a clear rejection rule.
