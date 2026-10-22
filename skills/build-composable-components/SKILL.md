---
name: build-composable-components
description: Design, implement, refactor, or audit React component families that know only UI while data, copy, and config come from outside, extending repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, menus, tabs, tables, dialogs, pickers, lists, record parts, responsive adapters, scoped Zustand component state, controlled or uncontrolled APIs, cva size and variant on container parts, and optimistic mutation boundaries inside a component family. Route React Hook Form field families to build-forms and query, mutation, or cache design to manage-server-state.
---

# Build Composable Components

Build component families that know only UI: data, copy, and configuration come
from outside, and every visible piece is a part the consumer composes.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

Three layers, dependencies pointing down: primitives (shadcn/Radix, `cn`),
composable families (roots, parts, item scopes, scoped stores), and feature
adapters (screens, record parts, queries, mutations, product rules). This
skill owns the family layer, the primitive extensions it needs, and the record
parts a feature composes from a family. A generic family never imports a
feature, query, mutation, record type, or product rule, and never fetches,
enumerates data, or holds product copy. Placement test: code that changes with
the product belongs in the feature adapter; code that changes with the design
system belongs in the family or the primitive.

## Required workflow

1. Read the repository's instructions, primitives, and neighboring families.
   Classify the task as `create`, `extend`, `refactor`, or `audit`.
2. Find current consumers and concrete requirements (who uses it and the
   problem the request names, roadmaps, backlogs, designs, sibling screens),
   in create and audit mode. Preserve behavior unless a change is requested.
3. Sketch before JSX: the generic parts, what the root shares, the container
   that owns each variant, the record parts, the consumer that reads the query
   and maps the data, which overlays persist, and who owns state and side
   effects. Then build it by the ladder below.
4. Run the [extension test](references/review-and-testing.md#extension-scenarios):
   add, omit, relabel, and reorder a part; insert a consumer separator; add a
   size; mount two instances; open an overlay from content that can unmount;
   fail a mutation.
5. Run the repository's checks in proportion to risk. Report decisions,
   preserved primitive contracts, and open assumptions. End with one
   `Skipped:` line (left out on purpose) and one `Not checked:` line (not
   verified).

## Smallest complete change

Write only what the task needs, in the layer that owns it. Take the first
option that fully works:

1. Skip parts, props, variants, and exports that neither the task nor a
   concrete requirement (step 2) names; list them in the handoff. Existing
   parts face only the [over-engineering decision test](references/review-and-testing.md#judge-over-engineering).
2. What the repository already has: a family, a part, or a simpler pattern.
3. A shadcn/Radix primitive that owns the role (`Card`, `Alert`, `Empty`,
   `Badge`), or a value it already has (`Button size="icon-lg"`) or a new value
   on its variant definition, instead of a restyled `div` or a class patch.
4. A semantic element, `data-*` attributes, and named groups before JavaScript.
5. Props, then context, then a scoped store, as State escalates below.
6. The smallest coherent generic family plus the record parts the feature
   reads. Export only the parts consumers compose.

- An existing primitive is not a reason to skip the generic family. When the
  task asks for reuse or two call sites share the anatomy, build
  `components/ui/<role>.tsx` over the primitive and compose it in the feature.
- Finish every place the change reaches: callers, tests, fixtures, and
  exports. Primitive props, refs, ARIA, focus, keyboard behavior, consumer
  `className` overrides, error handling that prevents data loss, and anything
  the user asked for are never cut.
- Mark a deliberate limit with one comment: `// shortcut: <limit>, <when to upgrade>`.

## Core contracts

The component knows only UI; data, copy, and config come from outside. A
consumer composes a family like this (copy the shape, not the names):

```tsx
<SelectableList value={selectedTaskIds} onValueChange={setSelectedTaskIds} itemValues={taskIds}>
  {canBulkEdit && (
    <SelectableListHeader>
      <SelectableListSelectAll aria-label="Select all tasks" />
      <SelectableListToolbar aria-label="Bulk task actions">
        <span><SelectableListCount /> selected</span>
        <TaskSelectableListMarkDone>Mark done</TaskSelectableListMarkDone>
        <TaskSelectableListDelete>Delete</TaskSelectableListDelete>
      </SelectableListToolbar>
    </SelectableListHeader>
  )}
  <SelectableListContent density={density}>
    {tasksQuery.isPending && <SelectableListLoading>Loading tasks…</SelectableListLoading>}
    {tasksQuery.isError && <SelectableListError>Tasks unavailable</SelectableListError>}
    {tasksQuery.data?.length === 0 && <SelectableListEmpty>No tasks yet</SelectableListEmpty>}
    {tasksQuery.data?.map((task) => (
      <TaskSelectableListItem key={task.id} task={task} />
    ))}
  </SelectableListContent>
</SelectableList>
```

Root and parts:

- The root holds only shared state: `value`/`onValueChange`, `open`, dialog
  state, the record passed once (record root), and ids an aggregate needs
  (`itemValues` for select-all or a count). Never items to render, loading or
  error flags, copy, `aria-*`, or visual config: the part that renders them
  takes them. A root with no element renders only its provider; a root over a
  primitive root keeps that primitive's props.
- Every visible piece is a child part the consumer can omit, reorder, or
  relabel. Copy is the `children` of the part that renders it, or a
  `placeholder` on that part. No part, generic or record, defaults its copy.
- A derived value is its own part with no function child; the consumer writes
  the wording around it: `<span><SelectableListCount /> selected</span>`.
- Each part renders one primitive or DOM role, takes
  `React.ComponentProps<typeof Primitive>` (no `forwardRef`), sets
  `data-slot`, spreads props, then applies required bindings
  (`<Checkbox {...props} checked={item.selected} />`), with
  `cn(base, className)`. A `triggerProps` bag means the child should be a part.
- `disabled`, loading, and event props belong to the action that owns them;
  consumers choose capability and order through parts, not boolean switches.
- Extend a wrapped primitive's contract (props, refs, events, accessibility,
  keyboard, defaults, variants, `asChild`); an omitted prop renders the base.
- Grouped controls get `role="toolbar"` and a name, a changing count or async
  result a polite live region, every icon-only trigger an accessible name.

Lists and record parts:

- The consumer reads the query and maps the data inside the list part. Never
  `items` on the root, a render-function child for items, or a `Collection`
  part. Loading, error, and empty are child parts inside the list, rendered
  from the consumer's query state.
- Item identity is set once on the item part and matches the React `key`;
  parts inside the item read it from an item scope, not from repeated `id`,
  `index`, or `selected` props.
- A record part (feature adapter) exists only where the record or a product rule is read:
  `TaskSelectableListItem task={task}` writes the row anatomy once;
  `TaskSelectableListMarkDone` binds a mutation and a permission. It takes the
  record as a prop or from its record root. Every other part is the generic
  part used directly; no pass-through wrappers. Anatomy two call sites would
  repeat is extracted once: generic as a family part, record as a record part.

State:

- Contexts carry shared behaviour state only: selection, open, the record.
  One context and one throwing hook per family; an item scope only when parts
  inside an item need its identity. Independent reactive behaviour slices use
  one scoped Zustand vanilla store per root, never a module-global store.
- Derive selected, checked, counts, and position during render; never sync
  them in an effect. A parent-owned value can be controlled-only; a dual-mode
  family detects control with `"value" in props`, never `radix-ui/internal`.

Styling:

- Visual config (`size`, `variant`, `density`) is a `cva` on the container
  part that owns the look (`TabsList`, `ActionMenuContent`,
  `SelectableListContent`), mirrored as `data-*` plus a `group/<name>` class.
  Descendants read it with `group-data-[size=lg]/<name>:` selectors;
  combinations use `compoundVariants`. No context or store carries a
  visual-only value. A part outside that container, such as a trigger, uses
  its primitive's own variant (`Button size="icon-lg"`).
- Call-site `className` is for layout (width, margin, grid placement); a
  component treatment is a `cva` value, never a class patch copied per site.

Overlays and side effects:

- An overlay opened from content that can unmount (menu content, a
  conditional part) is a persistent sibling of it; its open state lives in the
  record root or the component that renders both.
- A confirm action calls `event.preventDefault()`, stays disabled while
  pending, and closes on success; a parent that survives an optimistic unmount
  reports the failure. Result effects (close, navigate, reset) run through
  `mutateAsync` or mutation-level callbacks; cache code stays in server state.

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

- [composition.md](references/composition.md): open parts, consumer-mapped
  lists, aggregates, derived values, record families, names and JSX.
- [state-styling-and-effects.md](references/state-styling-and-effects.md):
  cva and group selectors, scoped Zustand, overlays, mutations.
- [review-and-testing.md](references/review-and-testing.md): audit flags,
  over-engineering test, extension scenarios.
- [examples/layered-family](examples/layered-family): type-checked `Roster`
  family, `ShiftCrewRoster` consumer, `ShiftCrewRosterItem` record part, and
  an optimistic mutation; copy the layering.

## Decision defaults

Use these only when the repository has no established convention:

- A generic family is `components/ui/<role>.tsx`; the root takes the role name
  and parts are `<Root><Part>` (`Roster`, `RosterList`). Record parts live in
  `features/<feature>/components/<record>-<role>.tsx` and prefix the generic
  name (`ShiftCrewRosterItem`, `TaskSelectableListMarkDone`).
- One family, one file of plain function components, one named export list at
  the end, no default export, no exported types, hooks, or variant functions
  nobody imports. Under React Compiler, no `useMemo`, `useCallback`, `memo`.
