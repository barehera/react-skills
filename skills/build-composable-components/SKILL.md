---
name: build-composable-components
description: Design, implement, refactor, or audit maintainable React component families that extend repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, shared menus, tabs, forms, selectors, tables, dialogs, responsive adapters, scoped Zustand state, controlled or uncontrolled APIs, root-owned size and variant propagation, and component-related optimistic server-state workflows.
---

# Build Composable Components

Build component families whose structure, styles, state, and side effects remain
coherent as new product requirements are added. Adapt every choice to the
repository instead of imposing a starter architecture.

## Required workflow

1. Inspect the repository instructions, package versions, design-system
   primitives, styling utilities, React Compiler configuration, state and server-state conventions,
   neighboring component families, and validation commands.
2. Find current consumers and infer likely extensions from concrete product
   requirements. Preserve behavior unless a change is requested.
3. Classify the task as `create`, `extend`, `refactor`, or `audit`.
4. Write a short family model before implementation:
   - root responsibility and shared inputs;
   - structural slots, item boundaries, and base items;
   - domain items and consumer composition;
   - transient content and persistent overlays;
   - state owner and side-effect owner;
   - family-level semantic styles and allowed overrides.
5. Audit every wrapped primitive's public contract: props, refs, events,
   accessibility, keyboard behavior, defaults, variants, sizes, and
   polymorphism. Extend the contract; do not silently replace it.
6. Implement the smallest coherent family. Keep business policy in focused
   domain components or adapters rather than generic structural slots.
7. Perform the extension test: add, omit, reorder, and conditionally render a
   hypothetical item; insert a consumer-owned layout or separator; add a new
   family size or variant; mount two isolated instances; launch an overlay from
   transient content; and exercise success and failure paths.
8. Run formatting, lint, typecheck, interaction tests, and build commands in
   proportion to risk. Report decisions, preserved contracts, validation, and
   unresolved assumptions.

## Non-negotiable contracts

- Supply shared domain data and semantic configuration once at the root.
- Make the root own family-wide `size`, `variant`, `density`, `tone`, or similar
  inputs. For DOM descendants, propagate visual values with root data
  attributes, named Tailwind groups, or inherited CSS variables before adding
  reactive JavaScript context. Make each connected slot map the values to its
  own styles.
- Preserve base defaults. An omitted family prop must render like the base
  primitive unless the documented extension intentionally changes the default.
- Spread compatible consumer props without letting them overwrite required
  internal bindings. Compose observational handlers, then apply the family's
  authoritative `value`, `open`, `disabled`, IDs, and behavior props.
- Do not encode reusable semantic sizing with ad hoc leaf `height`, `min-height`,
  padding, font-size, or icon-size classes.
- Keep consumer layout in `className`; promote repeated semantic appearance to
  a typed variant.
- Reuse the repository primitive that already owns a visual role. Build cards
  with `Card`, failures with `Alert`, empty/loading surfaces with `Empty`, and
  list rows with `Item` when those primitives exist. If a repeated semantic
  appearance is missing, extend the primitive with typed `variant` and `size`
  inputs instead of rebuilding it from a styled `div`.
- When React Compiler is enabled, write direct values and functions. Do not add
  `useMemo`, `useCallback`, or `React.memo` for routine render optimization or
  context-value stability; keep manual memoization only for a demonstrated
  semantic requirement the compiler cannot preserve.
- Use ordinary props, React context, or a scoped Zustand vanilla store according
  to state topology. Use context for stable transport, not as a selectorless
  high-frequency state bus. Never use a global store for repeated isolated
  instances.
- Determine controlledness from prop presence when `undefined` is a valid
  controlled value, such as an empty picker selection. Do not switch modes
  merely because the current value is `undefined`.
- Keep overlays alive outside transient menu, popover, or sheet content.
- Keep raw cache keys and cache mechanics in the repository's server-state
  layer. Synchronize and roll back every affected representation.
- Prefer composition over boolean switchboards. Consumers decide capability,
  ordering, and responsive placement.
- In JSX examples, render a boolean-only optional branch with `condition &&
  <Component />`. Use a ternary only when both branches produce meaningful UI;
  do not write `condition ? <Component /> : null`.
- Keep structural slots structural. Do not hide independently optional actions,
  fields, separators, status branches, or layout regions inside a convenience
  header, controls, list, or menu component.
- Establish item identity once at the item boundary. Nested fields and actions
  derive their item and current position from that boundary; do not require
  repeated `id` or `index` props that can drift after reordering.
- Choose one collection owner. Whenever a family root receives the collection,
  pass it once and let its `Collection`, `Items`, `Rows`, or `Results` boundary
  enumerate through a render callback. This applies to controlled mutable
  collections as well as remote results. Use a consumer `.map()` only when the
  family root does not receive the collection, such as a page rendering several
  independent card roots.
- Never let a `Results`, `Items`, `Rows`, or similar component hardcode item
  presentation. It may own enumeration plus cohesive loading, error, and empty
  gating only when the family owns the collection. Expose each item to a render
  callback and establish stable identity at the returned item boundary. The
  consumer chooses item markup while the family retains enumeration, state
  gating, selection, keyboard, disabled, and other behavioral logic.
- Let logic-bearing items accept ordinary primitive props and customizable
  `children`. A default icon or label may be convenient, but it must not be the
  only presentation available to the consumer.
- When an overlay implements an optional capability, expose it as an explicit
  persistent sibling in the consumer composition. Auto-mount an overlay from
  the root only when it is mandatory for every valid family instance.
- Bind overlay open state, mutation state, fields, and focused actions in the
  family, but let the consumer compose `DialogContent`, headers, fields,
  descriptions, media, and footers from repository primitives.
- Keep one cohesive compound family's root, context or scoped store, structural
  slots, focused items, and overlays in one shadcn-style component file by
  default. Split only infrastructure layers or parts with genuinely independent
  dependencies, ownership, or reuse; do not create one file per exported part.
- Let Radix, shadcn, or the repository primitive retain focus management,
  dismissal, ARIA behavior, and keyboard interaction.

## Read focused guidance

- Read [architecture-and-api.md](references/architecture-and-api.md) before
  creating a family, choosing slots, or defining its public API.
- Read [variants-and-styling.md](references/variants-and-styling.md) whenever
  extending a base primitive or adding size, variant, density, tone, responsive,
  or consumer styling.
- Read [state-and-lifecycles.md](references/state-and-lifecycles.md) when the
  family is controlled or uncontrolled, coordinates several children, uses
  Zustand, or launches persistent UI from transient content.
- Read [async-and-adapters.md](references/async-and-adapters.md) when the family
  performs mutations, synchronizes caches, navigates, emits analytics, applies
  permissions, or changes composition by environment.
- Read [review-and-testing.md](references/review-and-testing.md) for audits,
  refactors, accessibility checks, extension tests, and final verification.
- Read [examples.md](references/examples.md) when implementing a collection,
  controlled optional value, scoped Zustand family, composable overlay, or
  root-owned visual matrix.

## Decision defaults

Use these only when the repository has no established convention:

- Root data attributes, named groups, and CSS custom properties for visual
  configuration that follows DOM ancestry.
- React context for stable non-visual values or values needed outside that DOM
  ancestry, including a stable scoped-store handle.
- One vanilla Zustand store created per root when children need independent
  reactive slices or coordinated actions.
- `forwardRef` only when required by the React version or base contract; preserve
  ref support using the repository's current React convention.
- Root and slot class mappings driven by a shared family variant type; use CVA
  when the mapping benefits from a typed reusable API.
- Explicit child override props only as documented escape hatches, with root
  values as their defaults.
- Domain adapters that compose generic primitives rather than adding product
  policy to the root.

Do not force compound components, context, Zustand, CVA, Radix, shadcn, or a
particular folder layout onto a project with a simpler coherent solution.
