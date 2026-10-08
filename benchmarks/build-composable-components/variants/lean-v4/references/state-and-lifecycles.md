# State and lifecycles

Choose the smallest state mechanism that matches the component topology.

A family being compound is not a reason for Zustand. Independent selectors,
atomic actions, or state that must survive child unmounting are.

## Contents

- [React context versus scoped Zustand](#react-context-versus-scoped-zustand)
- [Controlled and uncontrolled APIs](#controlled-and-uncontrolled-apis)
- [Scoped Zustand](#scoped-zustand)
- [Transient content and persistent overlays](#transient-content-and-persistent-overlays)

## React context versus scoped Zustand

Context fits values that are stable or change rarely: a vanilla-store handle,
services or adapters, item identity scoped to one row, and configuration
JavaScript needs across portals.

When many compound children read different slices of frequently changing
state, carry only the stable `StoreApi` through context and call
`useStore(store, selector)` in each child, so only subscribers whose slice
changed re-render. The legacy `zustand/context` API is removed; use
`createStore`, an ordinary React context, and `useStore`
([example](examples.md#scoped-zustand-transport)).

## Controlled and uncontrolled APIs

Support both only when consumers need both, with one source of truth and one
change callback. Do not copy a changing controlled prop into local state, and
preserve the repository's existing controllable-state convention.

A generic family names controlled values by role (`value` with
`onValueChange`, `items` with `onItemsChange`); a feature composition may use
the record noun. Use `defaultItems` only for a
genuinely uncontrolled initial value; never re-synchronize it as if it were the
current controlled value.

## Scoped Zustand

When a store is justified:

- create one vanilla store per root instance and provide it through context,
  with a provider hook that throws a clear error outside the root;
- initialize from root props without recreating the store each render, and
  synchronize changing root inputs without clearing unrelated transient state;
- model semantic actions that read current store state, such as
  `toggleOpen()` instead of `setOpen(!open)`;
- avoid selectors that allocate a new object or array on every update; select
  primitives or use the repository's shallow-equality convention.

```ts
type ActionsState = {
  open: boolean
  pendingAction: "delete" | "archive" | null
  setOpen: (open: boolean) => void
  requestDelete: () => void
  clearPendingAction: () => void
}
```

In a controlled store-backed family, the external `value` stays authoritative:
an action notifies `onValueChange`, and the accepted value is synchronized into
the store before paint. A rejected controlled change must not persist as local
state. In uncontrolled mode the store owns the value and emits the same
callback.

## Transient content and persistent overlays

Menus, popovers, and temporary panels unmount their content when closed, so an
overlay launched from an item is a sibling of that content with its open state
at the root. When the overlay backs an optional action, the consumer composes
both (`{canDelete && <DeleteItem />}` and `{canDelete && <DeleteAlertDialog />}`),
so an omitted action leaves no hidden state behind. Lazily mount expensive
overlay bodies only while active.
