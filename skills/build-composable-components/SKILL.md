---
name: build-composable-components
description: Design, implement, refactor, or audit maintainable React component families that extend repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, menus, tabs, tables, dialogs, pickers, lists, responsive adapters, scoped Zustand component state, controlled or uncontrolled APIs, root-owned size and variant propagation, and optimistic mutation boundaries inside a component family. Route React Hook Form field families to build-forms and query, mutation, or cache design to manage-server-state.
---

# Build Composable Components

Build component families whose structure, styles, state, and side effects remain
coherent as new product requirements are added. Adapt every choice to the
repository instead of imposing a starter architecture.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, structural slots, item boundaries,
focused actions, scoped stores), and feature adapters (screens, schemas,
queries, mutations, product rules). Dependencies point downward only.

This skill owns the composable-family layer and the primitive extensions it
needs. A family never imports a feature module, reads a query, or encodes a
product rule. Placement test: code that changes when the product changes
belongs in the feature adapter; code that changes when the design system
changes belongs in the family or the primitive.

## Required workflow

1. Inspect the repository instructions, package versions, design-system
   primitives, styling utilities, React Compiler configuration, state and
   server-state conventions, neighboring component families, and validation
   commands.
2. Find current consumers and infer likely extensions from concrete product
   requirements. Preserve behavior unless a change is requested.
3. Classify the task as `create`, `extend`, `refactor`, or `audit`.
4. Write a short family model before implementation:
   - root responsibility and genuinely shared inputs;
   - structural slots, item boundaries, and base items;
   - domain items and consumer composition in the feature adapter;
   - transient content and persistent overlays;
   - state owner and side-effect owner;
   - family-level semantic styles and allowed overrides.
5. Audit every wrapped primitive's public contract: props, refs, events,
   accessibility, keyboard behavior, defaults, variants, sizes, and
   polymorphism. Extend the contract; do not silently replace it.
6. Implement the smallest coherent family. Keep business policy in the feature
   adapter rather than in generic structural slots.
7. Perform the extension test: add, omit, reorder, and conditionally render a
   hypothetical item; insert a consumer-owned layout or separator; add a new
   family size or variant; mount two isolated instances; launch an overlay from
   transient content; and exercise success and failure paths.
8. Run formatting, lint, typecheck, interaction tests, and build commands in
   proportion to risk. Report decisions, preserved contracts, validation, and
   unresolved assumptions.

## Core contracts

- Keep the root focused on the instance boundary and values the family must
  coordinate: controlled state such as `open` or `value`, family-wide visual
  configuration, shared domain objects used by several behavioral parts, and
  generated IDs. Put titles, labels, and other displayed copy in the `children`
  of the part that renders it; context may carry a generated label ID but not
  the copy itself.
- Put `disabled`, loading, and event props on the independently optional action
  that owns them. Root-level locks and handlers exist only for genuinely shared
  behavior such as a fieldset lock or `onOpenChange`; one action must be able
  to stay enabled while another is disabled.
- Make the root own family-wide `size`, `variant`, `density`, or `tone`. For
  DOM descendants, propagate visual values with root data attributes, named
  Tailwind groups, or inherited CSS variables before adding reactive context,
  and let each connected slot map the values to its own styles.
- Preserve base defaults and contracts. An omitted family prop renders like the
  base primitive. Spread compatible consumer props, compose observational
  handlers, then apply authoritative controlled values, generated IDs, and
  required behavior props after the spread.

  ```tsx
  // Previous: a consumer id can break the family's labelled-by wiring.
  <Text id={titleId} {...props} />

  // Improved: the required binding is applied after the consumer spread.
  <Text {...props} id={titleId} />
  ```
- Give every public part the props of the primitive or DOM role it renders.
  Treat `triggerProps`, `contentProps`, `labelProps`, or `itemProps` bags as
  evidence that the child needs an explicit slot. A compact convenience
  component may exist only as a thin composition of the same open slots.
- Prefer composition over boolean switchboards. Consumers decide capability,
  ordering, and responsive placement by omitting, reordering, or swapping
  slots. Keep structural slots structural; do not hide independently optional
  actions, fields, separators, or status branches inside a convenience part.
- Establish item identity once at the item boundary. Nested fields and actions
  derive their item and position from that boundary; do not require repeated
  `id` or `index` props that drift after reordering.
- Let the consumer `.map()` a presentational collection when the call site owns
  the array. Move a collection to the root only when the family owns a
  controlled snapshot, virtualization, sorting, or cohesive loading, error,
  and empty gating; then enumerate through a render callback that never
  hardcodes item presentation.
- Choose state transport by topology: ordinary props, then React context for
  stable non-visual values, then one scoped Zustand vanilla store per root for
  independent reactive slices. Never use a module-global store for repeated
  isolated instances. Determine controlledness from prop presence when
  `undefined` is a valid controlled value.
- Keep overlays alive outside transient menu, popover, or sheet content. Expose
  an optional overlay as an explicit persistent sibling in the consumer
  composition; auto-mount it from the root only when every valid instance needs
  it. The family binds open state, mutation state, and focused actions; the
  consumer composes content, headers, and footers from repository primitives.
- Keep raw cache keys and cache mechanics in the repository's server-state
  layer. When a family action mutates, synchronize and roll back every
  affected representation through that layer.
- Keep one cohesive family's root, context or scoped store, structural slots,
  focused items, and overlays in one shadcn-style component file by default.
  Let Radix, shadcn, or the repository primitive retain focus management,
  dismissal, ARIA behavior, and keyboard interaction, and reuse the primitive
  that already owns a visual role such as `Card`, `Alert`, `Empty`, or `Item`.

## Companion skill routing

Inspect the installed skill catalog before implementation when the request
crosses the family boundary.

- For React Hook Form field families, Zod form schemas, typed feature forms,
  or browser form UX, use `$build-forms` when available.
- For API contracts, query keys, TanStack Query hooks, mutation design, cache
  synchronization, or authenticated requests, use `$manage-server-state` when
  available. This skill only decides where a family's optimistic boundary
  sits; the hooks it calls belong to that skill.
- For deciding whether a product rule in the feature adapter deserves a
  comment, use `$document-business-logic` when available.
- If a useful companion is not installed, explain its concrete benefit once
  and ask whether the user wants it installed. Install only after approval and
  only through the environment's supported skill installer; otherwise offer
  `npx shadcn@latest add barehera/react-skills/<skill>`. Continue with this
  skill if the user declines and do not repeat the recommendation.

## Read focused guidance

- Read [architecture-and-api.md](references/architecture-and-api.md) before
  creating a family, choosing slots, defining its public API, or deciding JSX
  and polymorphism conventions.
- Read [variants-and-styling.md](references/variants-and-styling.md) whenever
  extending a base primitive, adding size, variant, density, tone, responsive,
  or consumer styling, or structuring long `cn(...)` class lists.
- Read [state-and-lifecycles.md](references/state-and-lifecycles.md) when the
  family is controlled or uncontrolled, coordinates several children, uses
  Zustand, runs under React Compiler, or launches persistent UI from transient
  content.
- Read [async-and-adapters.md](references/async-and-adapters.md) when the family
  performs mutations, synchronizes caches, navigates, emits analytics, applies
  permissions, or changes composition by environment.
- Read [review-and-testing.md](references/review-and-testing.md) for audits,
  refactors, accessibility checks, extension tests, and final verification.
- Read [examples.md](references/examples.md) when implementing a collection,
  controlled optional value, scoped Zustand family, composable overlay, or
  root-owned visual matrix.
- Read [examples/layered-family](examples/layered-family) before creating a
  family that a feature will drive from remote data. It type-checks a generic
  `Roster` family under `components`, a `ShiftCrewRoster` feature adapter that
  maps crew members and applies one documented product rule, and the optimistic
  TanStack Query mutation the adapter calls. Copy its layering, not its domain.

## Decision defaults

Use these only when the repository has no established convention:

- Root data attributes, named groups, and CSS custom properties for visual
  configuration that follows DOM ancestry.
- React context for stable non-visual values or values needed outside that DOM
  ancestry, including a stable scoped-store handle.
- One vanilla Zustand store created per root when children need independent
  reactive slices or coordinated actions.
- `forwardRef` only when required by the React version or base contract;
  preserve ref support using the repository's current React convention.
- Root and slot class mappings driven by a shared family variant type; use CVA
  when the mapping benefits from a typed reusable API.
- Explicit child override props only as documented escape hatches, with root
  values as their defaults.
- Generic families under `components/<family>.tsx` and their domain adapters
  under `features/<feature>/components`.

Do not force compound components, context, Zustand, CVA, Radix, shadcn, or a
particular folder layout onto a project with a simpler coherent solution.
