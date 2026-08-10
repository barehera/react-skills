# Migration and review

## Contents

- [Create a new architecture](#create-a-new-architecture)
- [Place or add one feature](#place-or-add-one-feature)
- [Migrate a flat architecture](#migrate-a-flat-architecture)
- [Audit without editing](#audit-without-editing)
- [Review checklist](#review-checklist)
- [Completion report](#completion-report)

## Create a new architecture

1. Verify the framework-owned roots and choose the source alias.
2. Identify the first pages, business nouns, and user-valued interactions.
3. Start with the smallest useful layer set. Do not add widgets until a large
   composed block needs independent ownership.
4. Establish app providers, shared transport/config/UI foundations, one page,
   and one vertical feature or entity slice.
5. Define stable direct external paths for that slice; keep support modules
   private and avoid barrels.
6. Add architecture linting only with user approval and only after paths and
   aliases are real.
7. Validate the first vertical slice before repeating the pattern.

Use the [canonical Next.js example](../examples/next-app-router/README.md) when
the project has App Router roots. Adapt names and optional segments to the real
application; never copy example domains into production code.

## Place or add one feature

1. Describe the user-valued interaction in one sentence.
2. Inspect one neighboring slice and all current consumers.
3. Separate reusable business nouns from the interaction itself.
4. Place UI, model/schema/store, API/actions, server state, feature config, and
   internal libraries under the feature only when each responsibility exists.
5. Compose sibling features from a page or widget instead of importing between
   them.
6. Expose only real stable implementation modules required by external owners.
7. Update consumers and validate; do not reorganize unrelated slices.

## Migrate a flat architecture

Migrate incrementally and keep the application runnable:

1. Record the current dependency graph and public imports before moving files.
2. Separate framework/app composition and Shared foundations first. Do not put
   every unclassified file into Shared permanently.
3. Move route-ready UI into page slices in broad strokes.
4. Choose one vertical business capability and move its components, hooks,
   schemas, constants, store, queries, API functions, tests, and feature assets
   together.
5. Replace sibling imports by composition above the slices or by extracting a
   true lower-layer owner.
6. Convert global technical buckets one owner at a time:
   - `components` → slice `ui` or `shared/ui`;
   - `hooks` → owner `model`, `ui`, `server-state`, or focused Shared lib;
   - `schemas`/`types` → the owning trust boundary or model;
   - `utils` → owner `lib` or `shared/lib/<purpose>`;
   - `constants` → owner config/model or focused shared config.
7. Update imports atomically for each moved slice and run the closest checks.
8. Remove an empty legacy folder only after searching all aliases, dynamic
   imports, tests, code generation, and build configuration.
9. Repeat by highest change pain, not alphabetically.

Use a temporary compatibility module only when a big-bang consumer migration
would be unsafe and the user approves staged deprecation. Do not introduce a
new barrel as the compatibility mechanism when direct forwarding modules or
package export aliases can provide a narrower bridge.

## Audit without editing

Report evidence with exact files and lines. Group findings by impact:

- dependency-direction or same-layer sibling violations;
- feature code hidden in app/shared/global technical folders;
- route entries that contain business implementation;
- client modules importing server-only integration or environment code;
- feature remote state stored in a global resource dump;
- duplicated API/server-state ownership;
- business workflows inside `shared/integrations` or `shared/lib`;
- barrels, wildcard exports, self-imports through a public entry, or unstable
  deep imports into another slice;
- Zustand duplicating TanStack Query state;
- premature shared abstractions and empty placeholder folders.

Do not implement audit fixes unless authorized.

## Review checklist

- Every runtime file has one discoverable owner.
- The layer set is minimal and framework roots are distinguished from FSD
  layers.
- Feature names describe user-valued interactions; entity names describe stable
  business nouns.
- Slice segments describe purpose and exist only when used.
- Imports flow downward; sibling slices do not import each other.
- External slice consumers use documented stable direct paths.
- No `export *` or re-export-only barrel has been introduced.
- Same-slice imports are relative and do not loop through an external entry.
- Shared code is business-agnostic and has a focused responsibility.
- Axios transport, TanStack Query state, Zustand state, forms, and visual UI
  retain separate owners.
- Client/server modules and environment variables cannot cross runtime
  boundaries accidentally.
- Tests, stories, fixtures, assets, translations, and config follow the code
  they validate or configure.
- Formatting, lint, typecheck, tests, architecture checks, and production build
  pass in proportion to the change.

## Completion report

State:

- the framework and selected layer set;
- the ownership decision for each moved or newly created module;
- direct public module paths and any preserved legacy imports;
- app/shared/server/client boundaries;
- intentionally omitted layers or segments;
- validation commands and results;
- deferred violations, compatibility bridges, and the next safe migration
  slice.
