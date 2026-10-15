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
needs. A family never imports a feature module, reads a query, calls a
mutation, or encodes a product rule. Placement test: code that changes when the
product changes belongs in the feature adapter; code that changes when the
design system changes belongs in the family or the primitive. A generic family
is named for its UI role, not a record type.

## Required workflow

1. Read the repository's instructions, primitives, and neighboring families.
   Classify the task as `create`, `extend`, `refactor`, or `audit`.
2. Find current consumers and infer likely extensions from concrete product
   requirements (roadmaps, backlogs, plans, designs, and sibling screens count
   as concrete requirements, in both create and audit mode). Preserve behavior
   unless a change is requested.
3. Sketch the family before JSX: its files and names, what the root shares, the
   structural slots and item boundary, which domain items the feature adapter
   composes, which content can unmount and which overlays persist, and who owns
   state and side effects, then build it by the ladder below.
4. Run the [extension test](references/review-and-testing.md#extension-scenarios):
   add, omit, and reorder an item; insert a consumer separator; add a size; mount
   two instances; open an overlay from content that can unmount; fail a mutation.
5. Run the repository's checks in proportion to risk. Report decisions,
   preserved primitive contracts, and open assumptions. End with one `Skipped:`
   line for what was left out on purpose and one `Not checked:` line for what
   could not be verified.

## Smallest complete change

Write only what the task needs, in the layer that owns it. Take the first
option that fully works:

1. Skip parts, props, variants, and exports that neither the task nor a
   concrete requirement (step 2) names; list them in the handoff. Existing
   parts face only the [over-engineering decision test](references/review-and-testing.md#judge-over-engineering).
2. What the repository already has: a family, a part, or a simpler pattern.
3. A shadcn/Radix primitive that owns the role (`Card`, `Alert`, `Empty`,
   `Item`) instead of a restyled `div`, or a new `size` or `variant` on it.
4. A semantic element, data attributes, or named groups before JavaScript.
5. Props, then context, then a scoped store, as State escalates below.
6. The smallest coherent family that meets the core contracts. Export only the
   parts consumers compose and the hooks they need to build their own parts.

- Finish every place the change reaches: callers, tests, fixtures, and
  exports. Primitive props, refs, ARIA, focus, keyboard behavior, consumer
  `className` overrides, and anything the user asked for are never cut.
- Mark a deliberate limit with one comment: `// shortcut: <limit>, <when to upgrade>`.

## Core contracts

Root and parts:

- The root holds only what several parts coordinate: controlled state (`open`,
  `value`), family-wide `size`, `variant`, `density`, or `tone`, and IDs from
  `React.useId()`. An adapter that binds several actions to one record passes
  the record once to its root, not to every action.
- Displayed copy is the `children` of the part that renders it; context may
  carry a label ID, never the copy. A part that shows a family-derived value,
  such as a count, passes the value to a function child that returns the
  wording, so the family holds no product wording.
- `disabled`, loading, and event props belong to the action that owns them, so
  one action can stay enabled while another is disabled. A root lock or handler
  exists only for behavior all parts share: a fieldset lock or `onOpenChange`.
- Each public part renders one primitive or DOM role and accepts that
  primitive's props as `React.ComponentProps<typeof Primitive>`, which includes
  `ref` in React 19, so parts need no `forwardRef`. A `triggerProps`,
  `contentProps`, or `itemProps` bag means the child should be a slot. A
  convenience component may exist only as a thin composition of the same open
  slots.
- Consumers choose capability and order by omitting, reordering, or swapping
  slots, not through boolean switch props. Structural slots stay structural;
  they do not hide independently optional actions, fields, separators, or
  status branches.
- Extend a wrapped primitive's contract instead of replacing it: props, refs,
  events, accessibility, keyboard behavior, defaults, variants, and `asChild`.
  An omitted family prop renders like the base primitive. Spread consumer
  props, merge `className` last with `cn(base, className)`, compose
  observational handlers, then apply required bindings after the spread:
  `<Text {...props} id={titleId} />`.
- UI or logic that two call sites would repeat is extracted once: generic
  anatomy as a family part, record anatomy as one component in the feature that
  owns the record, because copies drift apart.
- A part that groups controls or reports changing status follows its ARIA
  pattern, because the primitives do not provide it: `role="toolbar"` with an
  accessible name for an action group, a polite live region for a selection
  count or async result, and an accessible name on every icon-only trigger.

Collections:

- Set item identity once at the item boundary and use the same ID as the React
  `key`. Nested leaves derive their item, selection, and position from it;
  repeated `id`, `index`, or `selected` props go stale on reorder.
- When the call site owns a presentational array, the consumer `.map()`s it
  inside a structural list slot; a root that only derives an aggregate, such as
  all-selected or a total, takes the item IDs and never renders from them. Move
  a collection to the root only when the family owns a controlled snapshot,
  virtualization, sorting, or cohesive loading, error, and empty gating; then
  enumerate through a render callback that leaves item anatomy to the consumer.
  Never both: the consumer does not map an array it also passed to the root.

State:

- Non-visual state escalates from ordinary props, to React context for stable
  values, to one scoped Zustand vanilla store per root for independent reactive
  slices. A module-global store breaks repeated instances.
- Derive what props and item IDs already determine, such as selected, checked,
  indeterminate, counts, and position, during render. Do not store it or sync
  it in an effect, because the copy goes stale.
- A parent-owned clearable value can be controlled-only (`value: T | undefined`
  with a required `onValueChange`). A dual-mode family detects controlledness
  with `"value" in props`, as Radix's `useControllableState` does, because a
  `value !== undefined` check turns a cleared value uncontrolled, and resolves
  every controllable value through one helper in its own file.

Styling:

- Visual configuration follows the DOM first: root data attributes, named
  Tailwind groups, and inherited CSS variables, each slot mapping the value to
  its own styles, so a visual-only change does not re-render every slot through
  context. Use context only for portaled slots or values JavaScript behavior,
  not only CSS, must read. Copying a root value onto slot attributes is styling.
- Call-site `className` is for one composition's layout, such as width, margin,
  alignment, or grid placement. A size, spacing, typography, or color treatment
  that belongs to the component is a typed `size` or `variant` on the family or
  the primitive, because a class patch bypasses that API and has to be copied
  to every call site.
- When a call site needs a primitive in another role, such as a destructive
  `AlertDialogAction` or a smaller `Avatar`, add that variant to the primitive
  in `components/ui` through its existing variant definition. The new value
  keeps the base classes and default as written and applies its classes only
  under itself, so every call site that omits it renders exactly as before.

Overlays and side effects:

- An overlay launched from content that can unmount (menu, popover, or sheet
  content, or any part rendered conditionally) lives outside that content as a
  persistent sibling, and its open state lives in the component that renders
  both. The consumer composes overlays for optional actions explicitly; the
  root auto-mounts only overlays every valid instance needs.
- A confirm dialog's action calls `event.preventDefault()`, stays disabled
  while its mutation is pending, and closes on success, even for optimistic
  mutations. If the optimistic update unmounts the item hosting the dialog,
  report the failure from a surviving parent; do not hoist one shared dialog
  above the items, which detaches it from each item's capability check.
- Effects that depend on the result, such as closing, navigating, or resetting
  state, run after confirmed success through `mutateAsync` or mutation-level
  callbacks, because callbacks passed to `mutate()` do not run once the
  launching content has unmounted. Cache keys and mechanics stay in server state.

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

- [composition.md](references/composition.md): API shapes for parts,
  collections, item identity, adapters, names, and JSX.
- [state-styling-and-effects.md](references/state-styling-and-effects.md):
  variant propagation, class lists, scoped Zustand, overlays, mutations.
- [review-and-testing.md](references/review-and-testing.md): audits, the
  over-engineering decision test, extension scenarios.
- [examples/layered-family](examples/layered-family): read before building a
  family a feature drives from remote data. A type-checked generic `Roster`,
  a `ShiftCrewRoster` adapter, and its optimistic mutation; copy the layering.

## Decision defaults

Use these only when the repository has no established convention:

- Primitives and generic families live in `components/ui/<role>.tsx`. The root
  takes the role name with no suffix and every part is `<Root><Part>`, as in
  shadcn (`roster.tsx` exporting `Roster`, `RosterList`, `RosterItem`). A
  record composition lives in `features/<feature>/components/<record>-<role>.tsx`,
  named for the record it renders, not the field or screen that uses it, and
  reuses the generic role name verbatim (`roster.tsx` -> `shift-crew-roster.tsx`).
- One cohesive family (root, context or store, parts, overlays) lives in one
  file of plain function components, with `data-slot` on each part's element,
  one context hook that throws outside the root, and one named export list at
  the end with no default export, so every family reads the same.
- Each family-wide value has one exported type reused by the root and every
  part; a `cva` primitive's props use `VariantProps<typeof variants>`.
