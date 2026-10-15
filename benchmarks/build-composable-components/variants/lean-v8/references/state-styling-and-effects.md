# State, styling, and effects

How to implement the state, styling, overlay, and mutation contracts in
`SKILL.md`.

## Contents

- [Visual config on the container part](#visual-config-on-the-container-part)
- [Parts outside the container](#parts-outside-the-container)
- [Primitive variants](#primitive-variants)
- [Class lists and overrides](#class-lists-and-overrides)
- [Context and scoped Zustand](#context-and-scoped-zustand)
- [Controlled values](#controlled-values)
- [Overlays](#overlays)
- [Mutations](#mutations)

## Visual config on the container part

`size`, `variant`, and `density` are a `cva` on the part that owns the look,
never on the root and never in context. The part mirrors each resolved value
as a `data-*` attribute and declares a named group; descendants select from
that group, and combinations use `compoundVariants`. This is the shape of
shadcn's current `TabsList`:

```tsx
const tabsListVariants = cva(
  "group/tabs-list inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
  {
    variants: {
      size: { sm: "h-8", default: "", lg: "h-10" },
      variant: { default: "", line: "rounded-none border-b bg-transparent p-0" },
    },
    compoundVariants: [
      { variant: "line", size: "sm", className: "h-9" },
      { variant: "line", size: "default", className: "h-10" },
      { variant: "line", size: "lg", className: "h-11" },
    ],
    defaultVariants: { size: "default", variant: "default" },
  }
)

function TabsList({
  size = "default",
  variant = "default",
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      {...props}
      data-slot="tabs-list"
      data-size={size}
      data-variant={variant}
      className={cn(tabsListVariants({ size, variant }), className)}
    />
  )
}

// TabsTrigger reads the list's group:
// "group-data-[size=lg]/tabs-list:px-4 group-data-[variant=line]/tabs-list:border-b-2"
```

- Default the variant in the destructure so the `data-*` attribute always
  carries the resolved value the selectors match.
- Name the group after the container (`group/tabs-list`), not the root. A
  family nested inside another instance's content then never inherits the
  outer instance's look.
- An omitted variant renders exactly like the base primitive: every new class
  sits under a non-default `data-*` value or a non-default `cva` key.
- A portaled container such as `ActionMenuContent` or `PopoverContent` is its
  own group, so its items read it without context.
- Do not export the variants function unless another module imports it.

## Parts outside the container

A part that is not a DOM descendant of the container, typically a trigger,
takes its primitive's own variant at the call site instead of reading the
container's value:

```tsx
<ActionMenuTrigger size="icon-lg" aria-label={`Actions for ${task.title}`} />
<ActionMenuContent size="lg">…</ActionMenuContent>
```

The two values are set side by side by the consumer. Do not add a root
`size`, a context, or a store to keep them in sync; that is a visual-only
value travelling through behaviour state.

## Primitive variants

When a call site needs a primitive in another role, such as a destructive
`AlertDialogAction` or a smaller `Avatar`, add that value to the primitive in
`components/ui` through its existing variant definition. The new value keeps
the base classes and default as written and applies its classes only under
itself, so every call site that omits it renders exactly as before. Reuse an
existing value (`Button size="icon-lg"`, `Badge variant="secondary"`) before
adding one.

## Class lists and overrides

Keep a short class list as one string. When a part mixes base layout,
interaction states, descendant selectors, and variants, pass ordered strings
to `cn`, one per concern: base layout and default appearance first, each
group selector next, consumer `className` last, because later conflicting
classes win.

Call-site `className` is for one composition's layout: width, margin,
alignment, grid placement. A size, spacing, typography, or color treatment
that belongs to the component is a `cva` value, because a class patch
bypasses that API and has to be copied to every call site.

## Context and scoped Zustand

Context carries shared behaviour state only: the controlled value and its
setter, open state, the record a record root shares, and item identity scoped
to one row. It never carries `size`, `variant`, `density`, copy, or class
names. A pointer highlight is visual too: use `hover:` or the primitive's
`data-highlighted`, not a store.

One context and one hook per family; the hook throws a clear error outside
the root and stays unexported unless consumers build their own parts with it.
An item scope is a second, small context only when parts inside an item need
the item's identity (`RosterToggle` and `RosterLabel` read `toggleId`).

When many parts read different slices of frequently changing behaviour state
that the family owns, such as the keyboard-active cell of a data grid, create
one vanilla store per root, carry only the stable `StoreApi` through context,
and subscribe with a narrow selector in each leaf:

```tsx
function DataGrid({ children }: { children?: React.ReactNode }) {
  const [store] = React.useState(() =>
    createStore<DataGridState>((set) => ({
      activeCell: null,
      setActiveCell: (activeCell) => set({ activeCell }),
    }))
  )

  return <DataGridContext value={store}>{children}</DataGridContext>
}

function DataGridCell({ cellId, ...props }: React.ComponentProps<"td"> & { cellId: string }) {
  const store = useDataGridStore("DataGridCell")
  const active = useStore(store, (state) => state.activeCell === cellId)

  return <td {...props} data-slot="data-grid-cell" tabIndex={active ? 0 : -1} />
}
```

- Never a module-global store: two mounted roots must not share state. The
  legacy `zustand/context` API is removed.
- Actions are semantic and read current state (`toggleOpen()`, not
  `setOpen(!open)`).
- Selectors return primitives or use the repository's shallow-equality
  convention, because a new object on every update re-renders every
  subscriber.
- A controlled value stays in props and context, never copied into the store.
  Being compound is not a reason for a store; most families need only context.

## Controlled values

A generic family names controlled values by role (`value` with
`onValueChange`, `open` with `onOpenChange`); a record root may use the
record noun. A parent-owned clearable value can be controlled-only
(`value: T | undefined` with a required `onValueChange`). A dual-mode family
detects controlledness with `"value" in props`, as Radix's
`useControllableState` does, because `value !== undefined` turns a cleared
value uncontrolled; a boolean `open` may use `openProp ?? uncontrolledOpen`.
Never import `radix-ui/internal`. `defaultValue` is only an uncontrolled
initial value and is never re-synchronized.

## Overlays

An overlay launched from content that can unmount (menu content, a
conditional part) is a persistent sibling of that content, and its open state
lives in the record root or the component that renders both. When an overlay
backs an optional action, the consumer composes both
(`{canDelete && <DeleteItem />}` beside `{canDelete && <DeleteDialog />}`), so
an omitted action leaves no hidden state behind. Mount an expensive overlay
body only while it is open.

A confirm dialog's action calls `event.preventDefault()`, stays disabled
while its mutation is pending, and closes on success. A dialog that acts on a
selection snapshots the ids when it opens, so a concurrent change cannot
alter what it confirms.

## Mutations

An optimistic update cancels, snapshots, updates, rolls back, and reconciles
every affected representation: list, detail, aggregate, and scoped optimistic
UI. Updating only the visible list is a synchronization bug. This skill
decides where the optimistic boundary sits; `$manage-server-state` owns the
hook and cache code, as in the
[example mutation](../examples/layered-family/src/features/shift-crew/server-state/mutations/use-assign-shift-crew-mutation.ts).

Effects that depend on the result, such as closing, navigating, or resetting
state, run after confirmed success through `mutateAsync` or mutation-level
callbacks, because callbacks passed to `mutate()` do not run once the
launching content has unmounted. If the optimistic update unmounts the part
hosting the action, report the failure from a surviving parent.

Notify from one layer only, and keep retry and error presentation consistent
with the repository. Retry is a domain action, not a generic part concern.
