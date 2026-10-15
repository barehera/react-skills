# Composition

API shapes behind the core contracts in `SKILL.md`. Copy the shape, not the
domain names. Every family here knows only UI; data, copy, and config come
from the consumer.

## Contents

- [Open parts](#open-parts)
- [Consumer-mapped lists](#consumer-mapped-lists)
- [Aggregate ids on the root](#aggregate-ids-on-the-root)
- [Derived-value parts](#derived-value-parts)
- [Record families](#record-families)
- [Required bindings after a spread](#required-bindings-after-a-spread)
- [Switches and modes](#switches-and-modes)
- [Feature adapters](#feature-adapters)
- [Names and JSX](#names-and-jsx)

## Open parts

A closed component that owns the map, the status branches, or the copy
exposes no customization boundary:

```tsx
<MemberCombobox items={members} loading={isPending} placeholder="Unassigned" />
```

Split it instead: the root shares state, the list part owns layout and ARIA,
the item part owns the primitive item, selection, and identity, and the
consumer owns presence, order, data, and copy. Apply the same test to table
rows, command results, tree nodes, cards, carousel slides, and sortable items.

A header part that always renders a title, description, and edit action
closes the family to new capabilities. An inert span that consumers never
omit, move, or relabel needs no public part.

## Consumer-mapped lists

The consumer reads the query, maps the records inside the list part, and
renders loading, error, and empty as child parts from its own query state:

```tsx
<Combobox value={assigneeId} onValueChange={setAssigneeId}>
  <ComboboxTrigger aria-labelledby={labelId}>
    <ComboboxValue placeholder="Unassigned">{assignee?.name}</ComboboxValue>
  </ComboboxTrigger>
  <ComboboxContent>
    <CommandInput placeholder="Search members…" value={search} onValueChange={setSearch} />
    <CommandList>
      {membersQuery.isPending && <CommandLoading>Loading members…</CommandLoading>}
      {membersQuery.isError && <ComboboxError>Members unavailable</ComboboxError>}
      {membersQuery.data?.length === 0 && <ComboboxEmpty>No members found</ComboboxEmpty>}
      {membersQuery.data?.map((member) => (
        <MemberComboboxItem key={member.id} member={member}>
          <ComboboxItemIndicator />
        </MemberComboboxItem>
      ))}
    </CommandList>
  </ComboboxContent>
</Combobox>
```

- The root never receives `items`, `loading`, or `error`, and no part
  enumerates through a render-function child or a `Collection` part. A
  generic collection part forces a cast or a callback-annotated `T` that
  accepts any type; the consumer's `.map()` keeps inference.
- The search query is the consumer's state passed to the input it renders;
  the family does not own it unless several parts read it.
- A status part inside a list keeps the list's semantics: an `li` inside a
  `ul`, `role="status"` for loading, `role="alert"` for a failure.
- TanStack Query keeps `data` when a background refetch fails, so the error
  part and the stale rows can render together. That is the intended reading
  of independent parts; gate rows on `!isError` only when the product says so.

## Aggregate ids on the root

A root that derives an aggregate (select-all, indeterminate, a count, a
position out of a total) takes the ids it needs and never renders from them:

```tsx
<SelectableList value={selectedIds} onValueChange={setSelectedIds} itemValues={taskIds}>
```

`taskIds` comes from the same query the consumer maps
(`tasksQuery.data?.map((task) => task.id) ?? []`). The root prunes `value`
against `itemValues` once, so a removed row never counts as selected. Never
both directions at once: the root does not map the array the consumer also
renders.

Item identity is set once on the item part and doubles as the React `key`.
Parts inside the item read it from an item scope: `RosterItem` provides
`value`, `selected`, and a generated `toggleId`; `RosterToggle` and
`RosterLabel` read them, so reordering the list cannot leave a stale index.

## Derived-value parts

A value the family derives renders as its own part. The consumer writes the
words around it; the family holds none:

```tsx
<span><SelectableListCount /> selected</span>
<StepperTrigger>
  Step <StepperPosition /> of <StepperTotal />
  <StepperTitle>{step.title}</StepperTitle>
</StepperTrigger>
```

Never a function child such as ``{(count) => `${count} selected`}``. When the
wording needs a plural, the consumer composes it from data it already has, or
a record part reads the snapshot it acts on (`taskIds.length`). A live region
that announces the count wraps the whole phrase and stays mounted, so the
first change is announced.

## Record families

A feature composes a record family from the generic one. Record parts exist
only where the record or a product rule is read; every other piece is the
generic part used directly.

```tsx
<TaskActionMenu task={task} onActionError={setActionError}>
  <ActionMenuTrigger aria-label={`Actions for ${task.title}`} />
  <ActionMenuContent size="lg">
    <TaskActionMenuRename>Rename</TaskActionMenuRename>
    <TaskActionMenuDelete>Delete</TaskActionMenuDelete>
  </ActionMenuContent>
  <TaskActionMenuDeleteDialog>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <TaskActionMenuDeleteConfirm variant="destructive">Delete</TaskActionMenuDeleteConfirm>
    </AlertDialogFooter>
  </TaskActionMenuDeleteDialog>
</TaskActionMenu>
```

- **Record root.** `TaskActionMenu` receives the record once and shares it,
  the dialog-open state, and a required failure sink through one context.
  Its actions read the record from there instead of taking `task` each.
- **Record parts.** `TaskActionMenuRename` binds a mutation;
  `TaskActionMenuDelete` reads a permission and opens the dialog;
  `TaskActionMenuDeleteDialog` binds the dialog to the record root's open
  state. Each spreads the generic part's props and composes its handlers.
- **No pass-through wrappers.** `ActionMenuTrigger` and `ActionMenuContent`
  carry no record logic, so the consumer uses them directly. A
  `TaskActionMenuContent` that only forwards props is dead code.
- **Copy from outside.** Labels, dialog titles, and descriptions are the
  consumer's children. A record part renders record fields
  (`{member.name}`, an enum label map such as `crewRoleLabel[member.role]`),
  never default action or status copy.
- **Record item part.** A list row that renders the same record anatomy at
  two call sites is one record part with the record as a prop:
  `ShiftCrewRosterItem member={member} locked={locked}`. The screen computes a
  rule that needs the whole collection (the last lead) once and passes the
  result, rather than each row re-reading the collection.
- **Where results surface.** An optimistic delete unmounts the row and the
  dialog it hosts, so failures go to a sink owned by a surviving parent, set
  from the mutation promise.

## Required bindings after a spread

The consumer's props are spread first, its handler runs before the family's,
and the binding the family depends on is applied last:

```tsx
function ComboboxItem({
  value,
  onSelect,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, "value"> & {
  value: string | undefined
}) {
  const combobox = useCombobox("ComboboxItem")
  const checked = combobox.value === value

  return (
    <CommandItem
      {...props}
      data-slot="combobox-item"
      data-checked={checked}
      aria-checked={checked}
      onSelect={(itemValue) => {
        onSelect?.(itemValue)
        combobox.select(value)
      }}
    />
  )
}
```

## Switches and modes

A root such as `<ResourceActions showShare showDelete mobileSheet canMove />`
is a product-rule switchboard. A boolean prop is appropriate only when it
changes one cohesive behavior of the component rather than selecting
children.

The same applies to leftover `phase`, `mode`, or `layout` props. When the
consumer already expresses the mode by swapping, omitting, or reordering
parts, do not also label the root. A visual `variant="line"` is a `cva`
value on the container part, not a root prop.

## Feature adapters

The feature adapter evaluates permissions and policy and composes or omits
each capability; a generic root never decides who may act.

When the viewport changes the interaction primitive, such as a dropdown menu
on desktop and a sheet on mobile, the adapter renders one surface or the other
instead of spreading `isMobile` branches through generic parts. Responsive CSS
inside a part is fine when it is intrinsic to that part's layout.

## Names and JSX

- When a collection and its row would differ only by plural, name the roles:
  `ResourceCardItemList` and `ResourceCardItemListItem` (or `Menu` and
  `MenuItem`), not `ResourceCardItems` and `ResourceCardItem`.
- A part whose element the consumer may need to swap, such as a link for a
  button, takes `asChild` and renders `Slot.Root` from `radix-ui`, as the
  shadcn `Button` does, instead of an `as` or `href` prop. Layout-only parts
  such as a card header or `ul` need no polymorphism.
- Render an optional branch as `condition && <Component />` with a boolean
  condition; compare nullable values explicitly (`src != null &&`,
  `items.length > 0 &&`) because `0` renders as text. Use a ternary only when
  both branches render UI.
- With React Compiler enabled, write direct values and functions; do not add
  `useMemo`, `useCallback`, or `React.memo` for routine render optimization or
  context-value stability.
