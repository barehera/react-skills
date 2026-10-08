# State, styling, and effects

How to implement the state, styling, overlay, and mutation contracts in
`SKILL.md`.

## Contents

- [Root values through the DOM](#root-values-through-the-dom)
- [Class lists and overrides](#class-lists-and-overrides)
- [Context and scoped Zustand](#context-and-scoped-zustand)
- [Controlled values](#controlled-values)
- [Overlays](#overlays)
- [Mutations](#mutations)

## Root values through the DOM

The root writes `size` as a data attribute and declares a named group; each
slot maps the value to its own classes:

```tsx
type CardSize = "sm" | "default"

function Card({
  size = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: CardSize }) {
  return (
    <div
      {...props}
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-6 rounded-xl border py-6",
        "data-[size=sm]:gap-4 data-[size=sm]:py-4",
        className
      )}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="card-content"
      className={cn("px-6", "group-data-[size=sm]/card:px-4", className)}
    />
  )
}
```

An inherited CSS variable suits a new family whose slots share one token
(`[--card-space:--spacing(6)]` on the root, `p-(--card-space)` on slots). In an
existing primitive it would rewrite base classes, so use selectors there.

A portaled slot such as `DropdownMenuContent` is not a DOM descendant of the
root, so it reads the value from context, sets its own `data-size` and named
group, and its descendants select from that group.

## Class lists and overrides

Keep a short class list as one string. When a slot mixes base layout,
interaction states, descendant selectors, and variants, pass ordered strings
to `cn`, one per concern: base layout and default appearance first, each
variant's group next, consumer `className` last, because later conflicting
classes win.

For a supported per-slot override, put an optional data attribute or CSS
variable on that slot and apply the inherited root selectors only when it is
absent; do not rely on CSS source order. A child override prop is a documented
escape hatch whose default is the root value.

## Context and scoped Zustand

Context carries the root's controlled value and values that are stable or
change rarely: a store handle, services, item identity scoped to one row, and
configuration that JavaScript reads across portals. Being compound is not a
reason for a store.

When many parts read different slices of frequently changing state that the
family owns, create one vanilla store per root with
`React.useState(() => createStore(...))`, carry only the stable `StoreApi`
through context, and call `useStore(store, selector)` in each leaf, so only
parts whose slice changed re-render. The legacy `zustand/context` API is
removed.

- The context hook throws a clear error outside the root.
- Actions are semantic and read current state (`toggleOpen()`, not
  `setOpen(!open)`).
- Selectors return primitives or use the repository's shallow-equality
  convention, because a new object or array on every update re-renders every
  subscriber.
- A controlled value stays in props and context, never copied into the store,
  so nothing has to be synchronized. The store holds only state the family
  owns, such as a query or a highlighted item.

The [Roster family](../examples/layered-family/src/components/ui/roster.tsx)
keeps its controlled value in context and its pointer highlight in a scoped
store.

## Controlled values

A generic family names controlled values by role (`value` with
`onValueChange`, `open` with `onOpenChange`); a feature composition may use the
record noun. `defaultValue` is only an uncontrolled initial value and is never
re-synchronized as if it were the current value.

## Overlays

When an overlay backs an optional action, the consumer composes both
(`{canDelete && <DeleteItem />}` beside `{canDelete && <DeleteAlertDialog />}`),
so an omitted action leaves no hidden state behind. Mount an expensive overlay
body only while it is open.

## Mutations

An optimistic update cancels, snapshots, updates, rolls back, and reconciles
every affected representation: list, detail, aggregate, and scoped optimistic
UI. Updating only the visible list is a synchronization bug. This skill decides
where the optimistic boundary sits; `$manage-server-state` owns the hook and
cache code, as in the
[example mutation](../examples/layered-family/src/features/shift-crew/server-state/mutations/use-assign-shift-crew-mutation.ts).

Notify from one layer only, and keep retry and error presentation consistent
with the repository. Retry is a domain action, not a generic slot concern.
