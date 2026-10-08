---
name: build-composable-components
description: Design, implement, refactor, or audit maintainable React component families that extend repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, menus, tabs, tables, dialogs, pickers, lists, responsive adapters, scoped Zustand component state, controlled or uncontrolled APIs, root-owned size and variant propagation, and optimistic mutation boundaries inside a component family. Route React Hook Form field families to build-forms and query, mutation, or cache design to manage-server-state.
---

# Build Composable Components

Build component families on the repository's own primitives that stay open to
composition as product requirements grow.

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

1. Read the repository's instructions, primitives, neighboring families, and
   React Compiler setup. Classify the task as `create`, `extend`, `refactor`,
   or `audit`.
2. Find current consumers and infer likely extensions from concrete product
   requirements (roadmaps, backlogs, plans, designs, and sibling screens count
   as concrete requirements, in both create and audit mode). Preserve behavior
   unless a change is requested.
3. Sketch the family before JSX: what the root shares, the structural slots and
   item boundary, which domain items the feature adapter composes, which
   content is transient and which overlays persist, and who owns state and side
   effects.
4. Implement the smallest coherent family that satisfies the core contracts.
5. Run the [extension test](references/review-and-testing.md#extension-scenarios):
   add, omit, and reorder an item; insert a consumer separator; add a size; mount
   two instances; open an overlay from transient content; fail a mutation.
6. Run the repository's checks in proportion to risk. Report decisions,
   preserved primitive contracts, and open assumptions.

## Core contracts

Root and parts:

- The root holds only what several parts coordinate: controlled state (`open`,
  `value`), family-wide `size`, `variant`, `density`, or `tone`, a shared
  domain object, and generated IDs. Displayed copy is the `children` of the
  part that renders it; context may carry a label ID, never the copy.
- `disabled`, loading, and event props belong to the action that owns them, so
  one action can stay enabled while another is disabled. A root lock or handler
  exists only for truly shared behavior such as a fieldset lock or
  `onOpenChange`.
- Each public part renders one primitive or DOM role and accepts that
  primitive's props. A `triggerProps`, `contentProps`, or `itemProps` bag means
  the child should be a slot. A convenience component may exist only as a thin
  composition of the same open slots.
- Consumers choose capability and order by omitting, reordering, or swapping
  slots, not through boolean switch props. Structural slots stay structural;
  they do not hide independently optional actions, fields, separators, or
  status branches.
- Extend a wrapped primitive's contract instead of replacing it: props, refs,
  events, accessibility, keyboard behavior, defaults, variants, and
  polymorphism. An omitted family prop renders like the base primitive. Spread
  consumer props, compose observational handlers, then apply required bindings
  after the spread: `<Text {...props} id={titleId} />`.

Collections:

- Set item identity once at the item boundary. Nested leaves derive their item
  and position from it; repeated `id` or `index` props go stale on reorder.
- When the call site owns a presentational array, the consumer `.map()`s it
  inside a structural list slot. Move a collection to the root only when the
  family owns a controlled snapshot, virtualization, sorting, or cohesive
  loading, error, and empty gating; then enumerate through a render callback
  that leaves item anatomy to the consumer.

State, styling, and side effects:

- Visual configuration follows the DOM first: root data attributes, named
  Tailwind groups, and inherited CSS variables, with each slot mapping the value
  to its own styles, so a visual-only change does not re-render every slot
  through context. Use context only for portaled slots or values JavaScript
  must read.
- Non-visual state escalates from ordinary props, to React context for stable
  values, to one scoped Zustand vanilla store per root for independent reactive
  slices. A module-global store breaks repeated instances. A parent-owned
  clearable value can be controlled-only (`value: T | undefined` with a
  required `onValueChange`); if the family also supports uncontrolled use,
  detect controlledness with `"value" in props`, because a `value !== undefined`
  check turns a cleared value uncontrolled.
- An overlay launched from a menu, popover, or sheet lives outside that
  transient content as a persistent sibling. The consumer composes overlays for
  optional actions explicitly; the root auto-mounts only overlays every valid
  instance needs.
- Cache keys and cache mechanics stay in the server-state layer. A family
  action that mutates synchronizes and rolls back every affected representation
  through that layer.
- One cohesive family (root, context or store, slots, items, overlays) lives in
  one shadcn-style file. The primitive keeps focus, dismissal, ARIA, and
  keyboard behavior; reuse primitives that already own a visual role, such as
  `Card`, `Alert`, `Empty`, or `Item`.

## Companion skill routing

When the request crosses the family boundary, check the installed catalog:

- `$build-forms`: React Hook Form field families, Zod form schemas, typed
  feature forms, browser form UX.
- `$manage-server-state`: API contracts, query keys, TanStack Query hooks,
  mutation design, cache synchronization. This skill only decides where a
  family's optimistic boundary sits.
- `$document-business-logic`: whether a product rule in the feature adapter
  deserves a comment.
- `$use-preferred-react-stack`: library defaults and React Compiler policy.
- `$extract-named-helpers`: pure decisions inside components, hooks, and
  callbacks. Component anatomy and instance state stay here.

If a useful companion is missing, explain its concrete benefit once and ask
whether to install it. Install only after approval and only through the
environment's supported installer, otherwise offer
`npx --yes github:barehera/react-skills <skill>`, which installs it for the
project's saved agents. If the user declines, continue and do not ask again.

## References

- [architecture-and-api.md](references/architecture-and-api.md): creating a
  family, choosing slots, the public API, naming, JSX, and file boundaries.
- [variants-and-styling.md](references/variants-and-styling.md): size, variant,
  density, or tone propagation; long `cn(...)` lists.
- [state-and-lifecycles.md](references/state-and-lifecycles.md): controlled and
  uncontrolled values, scoped Zustand, React Compiler, overlays launched from
  transient content.
- [async-and-adapters.md](references/async-and-adapters.md): mutations,
  permissions, responsive composition, analytics, and routing.
- [review-and-testing.md](references/review-and-testing.md): audits, refactors,
  over-engineering verdicts, extension scenarios.
- [examples.md](references/examples.md): API shapes for an open card, a
  controlled collection, a remote result picker, required bindings after a
  spread, a scoped store, a persistent overlay, and a mutation boundary.
- [examples/layered-family](examples/layered-family): read before building a
  family a feature drives from remote data. It type-checks a generic `Roster`
  family under `components`, a `ShiftCrewRoster` feature adapter with one
  documented product rule, and the optimistic TanStack Query mutation it
  calls. Copy its layering, not its domain.

## Decision defaults

Use these only when the repository has no established convention:

- Generic families under `components/<family>.tsx`; their domain adapters under
  `features/<feature>/components`.
- One shared family variant type mapped per slot; CVA when the mapping
  benefits from a typed reusable API.
- Child override props only as documented escape hatches whose default is the
  root value.
- `forwardRef` only when the React version or base contract requires it.

Do not force compound components, context, Zustand, CVA, Radix, shadcn, or a
particular folder layout onto a project with a simpler coherent solution.
This governs introducing machinery. In an audit it does not permit removing an
existing part: judge each abstraction with the over-engineering decision test
in [review-and-testing.md](references/review-and-testing.md#judge-over-engineering),
where a low caller count is a signal, never the verdict.
