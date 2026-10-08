# Migration and review

## Create a new architecture

1. Establish app providers, shared transport/config/UI foundations, one page,
   and one vertical feature or entity slice with stable direct external paths.
2. Add architecture linting only with user approval and only after paths and
   aliases are real.
3. Validate the first vertical slice before repeating the pattern.

Adapt the [Next.js example](../examples/next-app-router/README.md) names and
optional segments to the real application; never copy example domains into
production code.

## Place or add one feature

Inspect one neighboring slice and all current consumers, and separate reusable
business nouns from the interaction itself. Compose sibling features from a
page or widget, expose only modules that external owners need, and do not
reorganize unrelated slices.

## Migrate a flat architecture

Migrate incrementally and keep the application runnable:

1. Record the current dependency graph and public imports before moving files.
2. Separate framework/app composition and Shared foundations first. Do not put
   every unclassified file into Shared permanently.
3. Move route-ready UI into page slices in broad strokes.
4. Choose one vertical business capability and move its components, hooks,
   schemas, constants, store, queries, API functions, tests, and feature assets
   together, using the
   [root folder map](architecture-and-placement.md#map-common-root-folders).
5. Replace sibling imports by composition above the slices or by extracting a
   true lower-layer owner.
6. Update imports atomically for each moved slice and run the closest checks.
7. Remove an empty legacy folder only after searching all aliases, dynamic
   imports, tests, code generation, and build configuration.
8. Repeat by highest change pain, not alphabetically.

Use a temporary compatibility module only when a big-bang consumer migration
would be unsafe and the user approves staged deprecation; prefer direct
forwarding modules or package export aliases over a new barrel as that bridge.

## Audit without editing

Report evidence with exact files and lines, grouped by impact. Check every core
contract in `SKILL.md`; common findings are:

- dependency-direction or same-layer sibling violations;
- feature code hidden in app/shared/global technical folders;
- route entries that contain business implementation;
- client modules importing server-only integration or environment code;
- feature remote state in a global resource dump, or duplicated API/server-state
  ownership;
- business workflows inside `shared/integrations` or `shared/lib`;
- barrels, wildcard exports, self-imports through a public entry, or unstable
  deep imports into another slice;
- Zustand duplicating TanStack Query state, or Axios transport, Query state,
  Zustand state, forms, and visual UI sharing one owner;
- tests, stories, fixtures, assets, translations, or config away from the code
  they validate or configure;
- premature shared abstractions and empty placeholder folders.

Do not implement audit fixes unless authorized.
