# Build Composable Components

[← React Skills catalog](../../README.md)

Design, implement, refactor, or review React component families that stay
composable as styling, state, permissions, overlays, and server-state behavior
become more demanding.

The skill is repository-aware. It extends existing shadcn, Radix, or custom
primitives while preserving their props, refs, accessibility, defaults, sizes,
and variants. Its central styling rule is that the family root owns semantic
configuration and each connected slot renders that configuration. A consumer
can write `size="lg"` once on the root instead of patching heights and padding
onto every child.

Structural slots remain open to composition: consumers can omit, reorder,
separate, or conditionally render focused fields and actions while those leaf
components keep their own logic. Collection item identity is supplied once at
the item boundary, so nested controls derive the current item and position
without repeated `id` or `index` props.

Collections follow one rule: if the family root receives the collection, its
`Collection`, `Items`, `Rows`, or `Results` component enumerates it through a
render callback. The family owns enumeration and state gating; the consumer
owns every item's anatomy. Consumer `.map()` remains for rendering independent
roots whose family does not receive that collection.

Visual configuration follows shadcn-style DOM propagation first: merged
classes, semantic data attributes, named groups, and inherited CSS variables.
React context is reserved for stable non-visual transport; frequently changing
compound state uses a scoped Zustand vanilla store with selector subscriptions.

## Install

Choose it from the interactive catalog:

```bash
npx --yes github:barehera/react-skills
```

Or install it directly:

```bash
npx shadcn@latest add barehera/react-skills/build-composable-components
```

## Use

```text
Use $build-composable-components to refactor this task action menu.
Preserve its Radix behavior, move shared resource data to the root, propagate
size and variant through connected slots, and keep the delete dialog alive
after the menu closes.
```

```text
Use $build-composable-components to design a reusable bulk-selection table.
Support controlled and uncontrolled selection, isolated instances,
permission-aware action composition, optimistic rollback, and root-owned
size and density.
```

```text
Use $build-composable-components to audit this Tabs extension.
Do not edit files. Check base-contract compatibility, variant propagation,
keyboard behavior, and maintainability.
```

## Guidance

- [Canonical skill instructions](SKILL.md)
- [Architecture and public API](references/architecture-and-api.md)
- [Variants and styling](references/variants-and-styling.md)
- [State and lifecycles](references/state-and-lifecycles.md)
- [Async boundaries and adapters](references/async-and-adapters.md)
- [Review and testing](references/review-and-testing.md)
- [Worked advanced examples](references/examples.md)

The shared `.agents/skills/VERSION` file records the React Skills release that
supplied the installed workflow.

## Update

```bash
npx shadcn@latest add barehera/react-skills/build-composable-components --overwrite
```
