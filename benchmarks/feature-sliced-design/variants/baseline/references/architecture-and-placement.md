# Architecture and placement

## Contents

- [Research basis](#research-basis)
- [Ownership model](#ownership-model)
- [Layer decisions](#layer-decisions)
- [Map common root folders](#map-common-root-folders)
- [Decide whether code is shared](#decide-whether-code-is-shared)
- [Avoid empty architecture](#avoid-empty-architecture)

## Research basis

Use the official Feature-Sliced Design specification as the semantic baseline:

- [Overview](https://feature-sliced.design/docs/get-started/overview)
- [Layers](https://feature-sliced.design/docs/reference/layers)
- [Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)
- [Migration from a custom architecture](https://feature-sliced.design/docs/guides/migration/from-custom)

The source methodology standardizes layers, isolates sibling slices, and groups
slice contents by purpose. This skill adapts its usual `index.ts` public API to
the React Skills direct-import and no-re-export-barrel contract.

## Ownership model

Choose the first true statement:

1. **Framework or tool requires the path** — keep it at the required root:
   Next.js `app/`, `pages/`, `public/`, `middleware.ts`, `instrumentation.ts`,
   generated code, repository `scripts/`, or package configuration.
2. **The whole application composes it** — place it in the app layer:
   providers, router setup, global store composition, global styles, analytics
   bootstrapping, error boundaries, and application entrypoints.
3. **A route or screen owns it** — place it in a page slice.
4. **A large reusable composed block owns it** — place it in a widget slice.
5. **A user-valued interaction owns it** — place it in a feature slice.
6. **A reusable business noun owns it** — place it in an entity slice.
7. **It is business-agnostic foundation code** — place it in a focused Shared
   segment.

Then choose the segment by purpose: `ui`, `model`, `api`, `server-state`, `lib`,
`config`, or a clear app/shared-specific purpose such as `providers`, `i18n`, or
`integrations`.

Use change coupling as the tie-breaker. Files that are usually changed together
should stay together. A feature deletion should remove its UI, schemas, state,
queries, tests, flags, and policies without hunting across project-wide
technical folders.

## Layer decisions

| Layer | Owns | Does not own |
| --- | --- | --- |
| App | startup, providers, routing composition, global styles, app-wide analytics/store setup | feature workflows and reusable UI primitives |
| Pages | route-ready screens and route-local loading/error composition | generic route framework files or reusable feature internals |
| Widgets | large self-sufficient UI/data compositions reused across pages | every page section by default |
| Features | user-valued interactions and all artifacts that change with them | generic primitives or stable business nouns used independently |
| Entities | reusable business nouns, their representations, contracts, and entity-owned reads | multi-entity workflows |
| Shared | business-agnostic UI, transport, config, integrations, i18n setup, and focused libraries | product features hidden behind generic names |

Do not use the deprecated `processes` layer. Coordinate multi-page flows from
app routing or a focused feature unless the existing application has a proven
alternative.

## Map common root folders

Use this table when refactoring a flat `src` tree. “Default destination” is a
starting point, not permission to move unrelated code during a scoped task.

| Existing folder | Default destination | Placement rule |
| --- | --- | --- |
| `api` | `shared/api`, owner `api`, or framework route root | Shared owns transport/generated client infrastructure; a slice owns endpoint adapters/actions; Next route files stay under framework `app/api` |
| `app` | framework root or `src/_app`/`src/app` | Distinguish Next.js routing from the FSD app layer |
| `assets` | `shared/assets` or root `public` | Imported/bundled assets go in source; unchanged URL-served files go in `public` |
| `components` | owner `ui` or `shared/ui` | Business UI stays with its owner; only business-agnostic primitives enter Shared |
| `config` | `shared/config`, app config, or owner `config` | Group by purpose such as environment, routes, or feature flags |
| `constants` | owner `config`, `model`, or focused `shared/config/<purpose>` | Keep a constant beside the policy it configures; avoid one global constants catalog |
| `env` | `shared/config/env` | Parse and expose typed environment access by runtime; do not leak secrets to client modules |
| `features` | `features/<feature>` | Each folder is one cohesive user-valued interaction, not a synonym for every business noun |
| `hooks` | owner `model`, `ui`, `server-state`, or focused `shared/lib` | Place hooks by what they coordinate, not by the fact that they are hooks |
| `libs` | `shared/lib/<purpose>` or `shared/integrations/<vendor>` | Use `lib` for contained internal libraries; use `integrations` for SDK/vendor boundaries |
| `locales` | `shared/i18n` or owner-local messages | Global setup and shared strings live in Shared; feature copy follows the feature |
| `providers` | app `providers` | Providers compose the application; provider-specific helpers remain with their owner |
| `public` | root `public` | Keep only static files served without importing |
| `schemas` | owner `model` or `api` | Put schemas at the trust boundary or domain that owns them; infer types when authoritative |
| `scripts` | root `scripts` | Keep build, release, codegen, and repository automation outside runtime source; fix misspellings such as `scriipts` |
| `server-state` | owner `server-state`; app/shared only for primitives | Colocate resource queries/mutations with the feature or entity; do not create a global resource dump by default |
| `store` | app composition or owner `model/store` | App owns global store wiring; a slice owns its scoped Zustand store; TanStack Query owns remote records |
| `types` | beside the owning contract | Avoid global types unless they are truly cross-domain foundations such as branding utilities |
| `utils` | owner `lib` or `shared/lib/<purpose>` | Name libraries by capability such as `date`, `text`, or `currency`; do not retain a miscellaneous utils bucket |

Additional folders are allowed when their purpose and ownership are clearer
than these defaults. Do not add another top-level layer merely because one team
has a local category name.

## Decide whether code is shared

Promote code only when all applicable checks pass:

- It does not encode a product workflow, feature flag, or business-specific
  branching hidden behind a generic name.
- At least two independent owners use it, or it is foundational by nature such
  as the HTTP client, environment parsing, design-system primitive, or i18n
  setup.
- Its API can remain stable while either consumer changes.
- Moving it lower does not create an upward dependency or import cycle.
- The shared module has one named purpose and a clear rejection rule.

Prefer temporary duplication over a premature shared abstraction when two
pieces only look similar. Promote after their stable common contract is known.

## Avoid empty architecture

Do not create every layer or segment on day one. A useful large-project minimum
is app, pages, features, entities, and shared, with only the segments needed by
the first vertical slices. Add widgets when a composed block has independent
meaning and reuse. Add a feature `api`, `server-state`, `model`, or `config`
folder only when the feature has code with that responsibility.
