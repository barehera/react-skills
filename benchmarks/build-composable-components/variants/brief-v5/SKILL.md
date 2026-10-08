---
name: build-composable-components
description: Design, implement, refactor, or audit maintainable React component families that extend repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, menus, tabs, tables, dialogs, pickers, lists, responsive adapters, scoped Zustand component state, controlled or uncontrolled APIs, root-owned size and variant propagation, and optimistic mutation boundaries inside a component family. Route React Hook Form field families to build-forms and query, mutation, or cache design to manage-server-state.
---

# Build Composable Components

This brief gives the goal, the boundaries that are easy to get wrong, and what
done looks like. Where it is silent, follow the repository and your judgment.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Goal

Write React that the next screen reuses by composing it, not by copying or
editing it: composable, maintainable, non-repetitive, and reusable, on
shadcn/Radix primitives that keep their focus, keyboard, and ARIA behavior.
Reuse a primitive that owns a visual role (`Card`, `Alert`, `Empty`) instead
of restyling a `div`.

- The same request produces the same structure every time, so a teammate can
  predict the files and names. Unless the repository has its own convention:
  - a generic family lives in `components/ui/<role>.tsx`, named for its UI
    role, never for a record type (`roster.tsx`);
  - a composition for one record type lives in
    `features/<feature>/components/<record>-<role>.tsx`
    (`shift-crew-roster.tsx`) and composes that record's anatomy once for
    every screen;
  - the root takes the role name with no `Root` suffix and each part is
    `<Root><Part>` (`Roster`, `RosterItem`, `RosterToggle`), as in shadcn;
  - one family (root, context or store, parts, overlays) is one file of plain
    function components, with `data-slot` on each part's element and one
    named export list at the end, with no default export.
- The design system grows through typed `size` and `variant` values, so it
  stays a design system rather than a collection of call-site patches.
- Nothing is written twice: UI or logic that two call sites would repeat is
  extracted once, as a family part or, for record anatomy, as one feature
  component, because copies drift apart.

## Layer placement

Dependencies point downward through three layers: primitives (shadcn/Radix
and `cn`), composable families (roots, parts, item boundaries, scoped stores),
and feature adapters (screens, schemas, queries, mutations, product rules).
This skill owns the family layer and the primitive extensions it needs.

A family never imports a feature module, reads a query, calls a mutation, or
encodes a product rule; the feature adapter does those things and composes the
family. Code that changes when the product changes belongs in the adapter;
code that changes when the design system changes belongs in the family or the
primitive. [examples/layered-family](examples/layered-family) type-checks this
split with a generic `Roster`, a `ShiftCrewRoster` adapter, and its mutation;
copy its layering, not its domain.

## Required workflow

1. Read the repository's instructions, primitives, and neighboring families.
2. Find current consumers and planning records (roadmaps, backlogs, plans,
   designs, sibling screens with the same shape); records are concrete
   requirements when creating and when auditing. Preserve behavior unless
   asked to change it.
3. Before JSX, decide what the root shares, the parts and item boundary, which
   content can unmount, and who owns state and side effects.
4. Build the smallest coherent family that meets the goal and the boundaries.
   Export the parts consumers compose and the hooks they need to build their
   own parts; keep helpers unexported.
5. Confirm [Done when](#done-when), then report decisions, preserved primitive
   contracts, and open assumptions.

## Boundaries

Parts and props:

- The root holds only what several parts coordinate: controlled state,
  family-wide `size` or `variant`, a shared domain object, and generated IDs.
  Displayed copy is the `children` of the part that renders it; context may
  carry a label ID, never the copy.
- Each public part renders one primitive or element and accepts that
  primitive's props. A `triggerProps`, `contentProps`, or `itemProps` bag means
  the child should be a part, because a bag hides the boundary and makes the
  root proxy every future prop.
- Consumers choose capabilities by including, omitting, or reordering parts,
  not through boolean switch props on the root, and a structural part does not
  hide an independently optional action.
- `disabled`, pending, and event props belong to the action that owns them, so
  one action stays available while another is disabled or running; a root
  lock or loading flag is only for behavior every part shares.
- Extend a wrapped primitive's contract instead of replacing it: spread
  consumer props, merge consumer `className` last with `cn`, compose consumer
  handlers, then apply required bindings after the spread so a consumer prop
  cannot break the wiring: `<Text {...props} id={titleId} />`. An omitted
  family prop renders exactly like the base primitive.
- Composite parts add the ARIA the primitives lack: `role="toolbar"` with an
  accessible name for a group of actions, a polite live region for a changing
  count or async result, and an accessible name on every icon-only trigger.

Collections:

- Set item identity once at the item boundary
  (`<RosterItem value={member.id}>`). Nested parts derive their item,
  position, and selection from it, because repeated `id`, `index`, or
  `selected` props go stale on reorder.
- When the call site owns a presentational array, the consumer maps it inside
  a list part and composes each item's anatomy. Move a collection to the root
  only when the family coordinates a controlled snapshot, virtualization,
  sorting, or cohesive loading, error, and empty gating, and then enumerate
  through a render callback that leaves item anatomy to the consumer. Never
  pass an array to the root and also map that same array at the call site.

Styling:

- Visual configuration follows the DOM first: root data attributes, named
  Tailwind groups (`group/roster` with `group-data-[size=sm]/roster:`), and
  inherited CSS variables, with each part mapping the value to its own
  classes, so a visual-only change does not re-render every part through
  context. Use context only for portaled slots or when JavaScript behavior,
  not only CSS, must read the value. Copying a root value onto a slot's
  attributes is still styling.
- Call-site `className` is for one composition's layout (width, margin,
  alignment, grid placement). A size, spacing, typography, or color treatment
  is a typed `size` or `variant`, because a class patch bypasses the API and
  must be copied to every call site. When a call site needs a primitive in
  another role, such as a destructive `AlertDialogAction` or a smaller
  `Avatar`, add that variant to the primitive through its existing variant
  definition with the default unchanged, so other call sites render as before.
- Split a long class list into ordered `cn(...)` arguments grouped by concern,
  with consumer `className` last.

Overlays and async actions:

- An overlay launched from content that can unmount (a menu, popover, sheet,
  or anything rendered conditionally) lives outside that content as a
  persistent sibling, because it would otherwise unmount with that content.
  The consumer composes an optional action's overlay explicitly, under the
  same capability check as the action, so an omitted action leaves no hidden
  overlay; the root auto-mounts only overlays every instance needs.
- A confirm dialog's action calls `event.preventDefault()` so the dialog does
  not close before the mutation settles, stays disabled while the mutation is
  pending, and closes on success, including for optimistic mutations. If the
  mutation can unmount the item that hosts the dialog, report the failure from
  a parent that survives instead of hoisting one shared dialog above the
  items, which would detach it from each item's capability check.

State and conventions:

- Non-visual state escalates from props, to context for stable values, to one
  scoped Zustand vanilla store per root for independent reactive slices. Never
  use a module-global store, because it couples every mounted instance.
- Make a parent-owned value controlled-only (`value: T | undefined` with a
  required `onValueChange`) unless consumers need both modes; then detect
  control with `"value" in props`, because a `value !== undefined` check turns
  a cleared value uncontrolled.
- Render an optional branch as `condition && <Part />` with a boolean
  condition, comparing nullable values explicitly (`src != null &&`,
  `items.length > 0 &&`), because `0` renders as text. Use a ternary only when
  both branches render UI.

## Audits

In an audit, read the planning records first and never invent one. A low
caller count is a signal, never the verdict, and the smallest-coherent-family
rule governs creating code, not removing existing parts. For each part,
variant, prop, hook, or export, the first matching rule decides:

1. Duplicate or test-only (a copy of another part, a second suite for the
   same behavior, an export or wrapper only a test uses): `remove`.
2. Extension point (a part consumers compose, or an exported hook or context
   accessor that lets consumers build their own parts, even with no outside
   caller today): `keep`.
3. A planning record names a consumer that needs this member (for a variant
   value, a consumer of the part it styles): `keep`, citing the record.
4. It holds structure, behavior, or a binding that a new screen would
   otherwise copy; a style value or switch does not qualify by itself: `keep`.
5. Dead (it forwards props unchanged, only selects children the consumer
   could omit, or nothing reads it, not even its own module): `remove`. A
   `mode` or `layout` switch that no consumer sets and no record mentions is
   removed with the private branches only it renders, even when a branch has
   real behavior, because a composable part can bring it back if a record asks.
6. Otherwise, such as an unused variant value or optional prop with distinct
   behavior and no record: `revisit`, naming the missing evidence and leaving
   the code unchanged.

Narrow before deleting: when every reader of an export is inside its own
module, drop `export` and keep the member. Report each judged member as
`keep`, `remove`, or `revisit` with its reason, and report a defect that holds
only under an assumption as a risk that names the assumption.

## Done when

- The family imports nothing from `features/`; every product rule, query, and
  mutation sits in the feature adapter.
- The files and names are the ones the goal predicts.
- Without editing the family, a consumer can add, omit, and reorder items,
  insert a separator, set another size, mount two independent instances, open
  an overlay from content that then unmounts, and recover from a failure.
- No anatomy, logic, prop list, or class string repeats across call sites, and
  call-site `className` is layout only.
- The repository's typecheck passes.

## Companion skill routing

When the request crosses the family boundary, check the installed catalog:

- `$build-forms`: React Hook Form field families, Zod form schemas, typed
  feature forms.
- `$manage-server-state`: API contracts, query keys, TanStack Query hooks,
  mutations, and cache updates; this skill only places the optimistic boundary.
- `$document-business-logic`: whether a product rule deserves a comment.
- `$use-preferred-react-stack`: library defaults and React Compiler policy.
- `$extract-named-helpers`: pure decisions inside components and hooks.

If a useful companion is missing, explain its benefit once and ask whether to
install it. Install only after approval, through the environment's supported
installer; otherwise offer `npx --yes github:barehera/react-skills <skill>`,
which installs it for the project's saved agents. If the user declines,
continue without asking again.
