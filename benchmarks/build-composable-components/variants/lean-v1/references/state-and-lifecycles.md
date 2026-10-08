# State and lifecycles

Choose the smallest state mechanism that matches the component topology.

## Contents

- [State ownership matrix](#state-ownership-matrix)
- [React context versus scoped Zustand](#react-context-versus-scoped-zustand)
- [React Compiler and manual memoization](#react-compiler-and-manual-memoization)
- [Controlled and uncontrolled APIs](#controlled-and-uncontrolled-apis)
- [Scoped Zustand](#scoped-zustand)
- [Separate remote and local state](#separate-remote-and-local-state)
- [Transient content and persistent overlays](#transient-content-and-persistent-overlays)

## State ownership matrix

| Requirement | Prefer |
| --- | --- |
| One owner and direct children | ordinary props and local state |
| Visual values across DOM descendants | data attributes, named groups, CSS variables |
| Stable non-visual values across compound slots | React context |
| Controlled and uncontrolled reusable value | controllable-state convention |
| Many children selecting independent reactive slices | scoped Zustand store |
| Repeated isolated row or card instances | one store per root instance |
| Remote authoritative state | repository server-state layer |

A family being compound is not a reason for Zustand. Independent selectors,
atomic actions, or state that must survive child unmounting are.

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

## React Compiler and manual memoization

Check the build configuration first; package presence alone does not prove the
compiler is enabled. When it is, write context values, callbacks, and derived
render data directly. New manual memoization needs a measured need or an
external identity contract the compiler cannot preserve. Leave unrelated
legacy memoization alone; consider removing it only in code you are already
editing. `$use-preferred-react-stack` owns compiler detection and the legacy
boundary.

## Controlled and uncontrolled APIs

Support both only when consumers need both, with one source of truth and one
change callback. Do not copy a changing controlled prop into local state, and
preserve the repository's existing controllable-state convention.

If `undefined` is a valid controlled value, as in a clearable picker, detect
controlledness from whether the prop was supplied, not from
`value !== undefined`
([example](examples.md#controlled-optional-value)). For non-clearable values,
keep the repository's convention.

Name controlled collections with the domain noun: `steps` with
`onStepsChange`, `rows` with `onRowsChange`. Use `defaultSteps` only for a
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

## Separate remote and local state

Server state owns remote records and cache synchronization. A family store may
own open state, the current step or local draft, selected IDs before
submission, pending overlay identity, and optimistic affordances that must
survive child unmounting. Do not copy a full remote entity into a local store
unless editing a draft requires a snapshot; when root props change, sync the
smallest required fields.

Use effects only to mirror changing root inputs into a store, subscribe to an
external service, or coordinate focus the primitive does not already handle,
and guard them so they never reset an in-progress interaction.

## Transient content and persistent overlays

Menus, popovers, and temporary panels unmount their content when closed, so an
overlay launched from an item cannot live inside that subtree:

```tsx
<ActionsProvider>
  <DropdownMenu>
    <DropdownMenuTrigger />
    <DropdownMenuContent>
      <DeleteItem />
    </DropdownMenuContent>
  </DropdownMenu>
  <DeleteAlertDialog />
</ActionsProvider>
```

Overlay state lives at the root. The family binds open state, pending state,
and the mutation; the consumer composes the overlay's visible anatomy from
repository primitives
([example](examples.md#composable-persistent-overlay)). Lazily mount
expensive overlay bodies only while active.

The root may provide an overlay every valid instance needs. When an overlay
backs an optional action, the consumer composes both explicitly:

```tsx
<ActionsRoot>
  <ActionsMenu>
    {canDelete && <DeleteItem />}
  </ActionsMenu>
  {canDelete && <DeleteAlertDialog />}
</ActionsRoot>
```

This keeps capability presence visible and keeps an omitted action from
leaving hidden feature state behind.
