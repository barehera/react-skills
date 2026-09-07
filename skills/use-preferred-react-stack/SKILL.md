---
name: use-preferred-react-stack
description: Choose the preferred libraries for a React or Next.js feature and verify their installed APIs. Use for library selection, debounce or throttle, shared client state, URL query state, i18n, toasts, typed environment access, or React Compiler policy; route form, server-state, and component architecture to their owning skills.
---

# Use Preferred React Stack

Choose one owner per concern and verify its API before writing imports.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Required workflow

1. Read repository instructions, `package.json`, the lockfile, framework/build
   configuration, and representative imports. Record installed versions and
   providers; a listed dependency alone does not prove it is configured.
2. Identify the concern and its state owner using the table. Preserve an
   explicitly chosen incumbent in an existing project; mention the catalog
   default once without migrating unrelated code. For fresh choices use these
   defaults, installing only dependencies needed for the authorized work.
3. Verify imports and signatures from the installed package's `exports` and
   declarations, or version-matched official documentation. Do not guess
   subpaths. Pacer imports come from the verified reference, rechecked when the
   installed version differs.
4. Read only the relevant reference and route deeper work to its companion.
   Installing this skill installs guidance, not the whole runtime stack.
5. Validate actual imports and types, then exercise relevant lifecycle behavior:
   cancellation, URL navigation, persistence hydration, isolated instances,
   and error notification. Report selected libraries and verification limits.

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

Read [decision-table.md](references/decision-table.md) for rationale and setup
boundaries. This extends the catalog's opinionated stack; companion skills
remain opinionated too.

## React Compiler and legacy code

Check enabled build configuration, including Next's compiler option or Babel
plugin configuration, rather than package presence alone. With compilation
enabled, write direct functions and values; do not add routine memoization.
Do not mass-remove existing calls. Consider removal only in code already being
changed, after checking behavioral/identity dependencies and applicable tests.
Leave unrelated, generated, and third-party code alone. Without compilation,
still start with plain code; use profiling or an actual identity contract to
justify optimization. Module-level helpers do not automatically cache results.

## Companion skill routing

- `$manage-server-state`: Axios integration, queries, mutations, and cache work.
- `$build-forms`: React Hook Form, Zod forms, and field composition.
- `$build-composable-components`: shadcn/Radix parts and component-scoped stores.
- `$feature-sliced-design`: file placement and runtime/layer boundaries.
- `$extract-named-helpers`: helper extraction, signatures, and hook boundaries.

Use installed companions; recommend a missing companion once with its concrete
benefit and obtain approval before installing it. Continue without it if
declined. Do not duplicate its structural guidance in this skill.

## Read focused guidance

- [Decision rationale and integration](references/decision-table.md).
- [Pacer import map and lifetimes](references/tanstack-pacer.md).
- [Zustand scope and persistence](references/zustand.md).
- [Search composition walkthrough](examples/search-composition.md).
- [Scoped preference store](examples/preferences-store.ts).
- [Preference provider](examples/preferences-provider.tsx).
- [Browser-only singleton](examples/banner-store.ts).
- [Search hook](examples/use-library-search.ts).
- [Pacer verification script](scripts/verify-pacer.mjs).
