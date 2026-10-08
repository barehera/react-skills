---
name: use-preferred-react-stack
description: Choose the preferred libraries for a React or Next.js feature and verify their installed APIs. Use for library selection, debounce or throttle, shared client state, URL query state, i18n, toasts, typed environment access, or React Compiler policy; route form, server-state, and component architecture to their owning skills.
---

# Use Preferred React Stack

Choose one owner per concern and verify its API before writing imports.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns library selection across all three layers and verifies the
installed APIs. It routes families to `$build-composable-components`, field
families and typed forms to `$build-forms`, and remote state to
`$manage-server-state`.

## Required workflow

1. Read repository instructions, `package.json`, the lockfile, framework/build
   configuration, and representative imports. Record installed versions and
   providers; a listed dependency alone does not prove it is configured.
2. Pick the concern's owner from the table. In an existing project, keep an
   explicitly chosen incumbent and mention the catalog default once without
   migrating unrelated code. For fresh choices use the defaults, installing
   only dependencies the authorized work needs.
3. Verify imports and signatures from the installed package's `exports` and
   declarations, or version-matched official documentation; do not guess
   subpaths. Take Pacer imports from the verified reference.
4. Read only the relevant reference and route deeper work to its companion.
5. Validate actual imports and types, then exercise relevant lifecycle
   behavior: cancellation, URL navigation, persistence hydration, isolated
   instances, error notification. Report selected libraries and verification
   limits.

## Default decisions

“Avoid adding” applies to new choices; it is not an instruction to replace an
established library or native behavior during an unrelated task.

| Concern | Default | Avoid adding | Boundary |
| --- | --- | --- | --- |
| Timing control | TanStack Pacer | lodash debounce, custom repeated timer loops | A one-shot delay can use `setTimeout`; Query owns request retries |
| Remote state | TanStack Query | effect-driven fetch state, SWR | Framework server reads keep their runtime owner |
| Shared reactive client state | Zustand | Redux, Jotai, broad mutable context bags | Local `useState` and stable context remain appropriate; scope stores per owner |
| URL state | nuqs | manual router replacement synchronization | Server components read/parse `searchParams`; URL is authoritative |
| Forms and validation | React Hook Form + Zod + zodResolver | Formik or a parallel ad-hoc form state engine | Simple native controls need no form framework |
| Next.js translations | next-intl | a second i18n library or inline translatable copy | Follow locale policy; do not retrofit Next.js into plain React |
| Transient notices | sonner | `alert` or another toast stack | Persistent errors/status also need visible UI |
| Next.js environment access | `@t3-oss/env-nextjs` | feature-level raw `process.env` access | Server/client schemas stay separate; build scripts may read env directly |
| Render optimization | React Compiler when configured | routine new `useMemo`, `useCallback`, `memo` | Verify compilation; preserve unrelated legacy calls |
| HTTP transport | Existing Axios wrapper | another client per feature | Preserve coherent incumbent/generated transport |
| UI primitives | shadcn/Radix | independently restyled controls | Keep semantic HTML and existing primitive contracts |

These are defaults for the listed concerns, not a reason to add Next.js,
providers, persistence, or a compiler to every task.

## React Compiler and legacy code

Check the enabled build configuration (Next's compiler option or the Babel
plugin), not package presence. With compilation enabled, write direct functions
and values without routine memoization. Do not mass-remove existing calls:
consider removal only in code already being changed, after checking identity
dependencies and tests; leave unrelated, generated, and third-party code alone.
Without compilation, still start with plain code; justify optimization with
profiling or an actual identity contract.

## Companion skill routing

- `$manage-server-state`: Axios integration, queries, mutations, and cache work.
- `$build-forms`: React Hook Form, Zod forms, and field composition.
- `$build-composable-components`: shadcn/Radix parts and component-scoped stores.
- `$feature-sliced-design`: file placement and runtime/layer boundaries.
- `$extract-named-helpers`: helper extraction, signatures, and hook boundaries.

Use installed companions; recommend a missing one once with its concrete
benefit and install it only after approval. Continue without it if declined.

## Read focused guidance

- [Setup boundaries per library](references/decision-table.md).
- [Pacer import map and lifetimes](references/tanstack-pacer.md), rechecked by
  [verify-pacer.mjs](scripts/verify-pacer.mjs).
- [Zustand scope and persistence](references/zustand.md).
- [Search composition](examples/search-composition.md) with its
  [hook](examples/use-library-search.ts),
  [scoped store](examples/preferences-store.ts), and
  [provider](examples/preferences-provider.tsx);
  [browser-only singleton](examples/banner-store.ts).
