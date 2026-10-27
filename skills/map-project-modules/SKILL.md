---
name: map-project-modules
description: Keep a one-page Markdown map of a project's modules, entry points, and most-imported files in `.agents/map/MODULE_MAP.md`, and use it to find code with a targeted search instead of broad reading. Use at the start of work in a repository that has the map; when orienting in an unfamiliar or large codebase; when asked where something lives or how modules connect; or when the map's commit is older than changes to the modules it lists.
---

# Map Project Modules

Write one short map of the codebase, then find code by reading the map,
searching narrowly, and opening only the lines that match.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no layer and changes no code. The map records the layer each
module belongs to, so a later task places code without re-deriving the split.

## The map

```markdown
# Module map

Commit: <short hash> (<YYYY-MM-DD>)

## Entry points

- `<path>` — <what starts here: app root, router, providers, server entry>

## Modules

| Path | Layer | Purpose | Entry file | Uses |
| --- | --- | --- | --- | --- |
| `src/components/ui` | primitive, family | shadcn primitives and generic families | — | — |
| `src/features/orders` | feature adapter | Order list, cancel and refund rules | `index.tsx` | `components/ui`, `lib/api` |

## Hub files

| File | Imported by |
| --- | --- |
| `src/lib/api/client.ts` | 41 files |
```

One row per module (a feature, a route group, a shared folder), not per file.
Keep the map under about 150 lines, because every task reads it.

## Required workflow

### Use the map

1. At the start of a task, read `.agents/map/MODULE_MAP.md` if it exists.
2. Pick the modules the task touches, then search inside them only:
   `grep -rn <term> <module path>`.
3. Open only the files and lines the search found. Read wider only when those
   lines point elsewhere.
4. If the header commit is older than the work, run
   `git diff --stat <commit> -- <module paths>`. Refresh the rows of modules
   that changed; leave the rest.

### Build or refresh the map

1. List the tracked source tree two or three levels deep with
   `git ls-files`, skipping build output, generated code, and assets.
2. Find entry points from `package.json` scripts, the framework config, and
   the routes or app folder.
3. For each module, read its entry or main file and write its purpose in a
   few words from what the code does, not from the folder name. Record the
   layer and the modules it imports.
4. Find hub files by counting import sources, for example
   `grep -rhoE "from ['\"][^'\"]+['\"]" src | sort | uniq -c | sort -rn | head -20`,
   then resolve path aliases and keep the top ten real files.
5. Write the header with `git rev-parse --short HEAD` and the date.
6. The first time you create the map, add one line to the repository's agent
   instructions file (`AGENTS.md`, or `CLAUDE.md` when that is the only one):
   `Read .agents/map/MODULE_MAP.md before searching the code.` Tell the user
   you added it.

## Smallest complete change

Write only the map the work needs. Take the first option that fully works:

1. No map for a small repository, about 50 source files or fewer, where a
   directory listing and a search are already enough.
2. Use the existing map as it is when its commit covers the modules in play.
3. Refresh only the rows of modules that changed since the header commit.
4. Build the full map.

- Never put secrets, environment values, or internal URLs in the map, because
  it may be committed.
- Never let the map replace reading the code it points to before editing.
- End the handoff with one `Skipped:` line for what was left out on purpose
  and one `Not checked:` line for what could not be verified.

## Companion skill routing

- Where code should live, how features are sliced, and which imports are
  allowed belong to `$feature-sliced-design`. The map describes the structure;
  it does not decide it.
- A fact about the project that is not structure (a decision, a gotcha, a
  preference) goes to `$keep-project-memory`.
- If a useful companion is not installed, explain its concrete benefit once
  and ask before installing it. Continue without it if the user declines.

## Defaults

- Location: `.agents/map/MODULE_MAP.md` at the repository root.
- Git: the skill never commits or ignores the map; the user decides.
- Paths are relative to the repository root and wrapped in backticks.
