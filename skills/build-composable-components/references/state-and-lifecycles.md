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
- [Effects and synchronization](#effects-and-synchronization)
- [IDs and instance safety](#ids-and-instance-safety)

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

Do not add Zustand because a family is compound. Use it when independent
selectors, atomic actions, or lifecycle persistence justify a store.

## React context versus scoped Zustand

React context is appropriate for values that are stable or change rarely:

- a stable vanilla-store instance;
- immutable services or adapters;
- item identity scoped to one row;
- configuration needed by JavaScript across portals or non-DOM descendants.

When a provider value changes, every component reading that context receives an
update. Memoizing the object prevents accidental identity changes but does not
provide per-field subscriptions.

Use a scoped Zustand vanilla store when many compound children read different
pieces of frequently changing state. Carry only the stable `StoreApi` through
React context, then call `useStore(store, selector)` in each child. This keeps
React context stable while Zustand updates only subscribers whose selected
value changed.

Do not use the removed legacy `zustand/context` API. Create the store with
`createStore`, provide it with ordinary React context, and subscribe with
`useStore`.

## React Compiler and manual memoization

Inspect the build configuration before adding memoization hooks. When React
Compiler is enabled, declare context values, callbacks, and derived render data
directly and let the compiler optimize them. Do not wrap routine functions or
objects in `useCallback`, `useMemo`, or `React.memo` preemptively.

Manual memoization may remain only when identity is itself an external semantic
contract—for example, an imperative third-party subscription explicitly
requires it—and profiling or documentation shows the compiler cannot preserve
that contract. Record that reason next to the exception.

## Controlled and uncontrolled APIs

Support both only when consumers need both:

```ts
type SelectionProps = {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}
```

Keep one source of truth. Controlled mode derives from `value`; uncontrolled
mode owns internal state initialized by `defaultValue`. Emit changes through
one callback path.

If `undefined` is a valid controlled value, determine mode from whether the
consumer supplied the prop, not from `value !== undefined`:

```ts
const controlled = Object.prototype.hasOwnProperty.call(props, "value")
```

This matters for clearable pickers. A controlled picker may begin empty, select
an item, and clear again without switching ownership. For non-clearable values
where `undefined` is invalid, preserve the repository's existing convention.

Use the domain noun for controlled collection props: `steps` with
`onStepsChange`, `items` with `onItemsChange`, or `rows` with `onRowsChange`.
Use `defaultSteps` only for a genuinely uncontrolled initial value. A prop named
`defaultSteps` must not be repeatedly synchronized as though it were the current
controlled value.

Do not copy a changing controlled prop into local state and then let the copies
diverge. Preserve the repository's existing controllable-state convention when
one exists.

## Scoped Zustand

When a store is justified:

1. Create a vanilla store once per root instance.
2. Put the store in React context.
3. Expose a required provider hook with a clear error outside the root.
4. Expose narrow selector hooks or let children select only needed slices.
5. Initialize from root props without recreating the store on every render.
6. Synchronize changing root inputs deliberately without clearing unrelated
   transient state.

Model semantic actions:

```ts
type ActionsState = {
  open: boolean
  pendingAction: "delete" | "archive" | null
  setOpen: (open: boolean) => void
  requestDelete: () => void
  clearPendingAction: () => void
}
```

Implement actions from current store state. Avoid stale closure patterns such
as `setOpen(!open)` when `toggleOpen()` can read the latest value atomically.

Never use one module-global store for repeated isolated menus, rows, cards, or
forms.

Avoid selectors that allocate a new object or array on every store update. Use
one primitive selector per value, a stable derived value, or the repository's
shallow-equality convention.

For a controlled Zustand-backed family, keep the external `value` authoritative.
An action should notify `onValueChange`; synchronize the accepted controlled
value into the scoped store before paint. In uncontrolled mode, the store owns
the value and emits the same callback. Do not let a rejected controlled change
become permanent local state.

## Separate remote and local state

Server state owns remote records and cache synchronization. The family store
may own:

- open and closed state;
- current step or local draft;
- selected IDs before submission;
- pending overlay identity;
- local optimistic affordances that must survive child unmounting.

Do not duplicate the full remote entity in a local store unless editing a draft
requires a snapshot. If root props change, synchronize the smallest required
fields.

## Transient content and persistent overlays

Menus, popovers, and temporary panels often unmount their content when closed.
An overlay launched from an item must not live only inside that transient
subtree.

Use this structure:

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

Keep a state-bound overlay root open to consumer anatomy:

```tsx
<TaskActionsDeleteAlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>{/* consumer-owned anatomy */}</AlertDialogHeader>
    <AlertDialogFooter>
      <TaskActionsDeleteCancelButton />
      <TaskActionsDeleteAction />
    </AlertDialogFooter>
  </AlertDialogContent>
</TaskActionsDeleteAlertDialog>
```

The family controls open state, pending state, and the mutation. The consumer
controls visible structure and can omit, reorder, or augment regions.

Keep overlay state at the root. Render overlays as siblings of transient
content and lazily mount expensive overlay bodies only while active.

The root may provide required overlays when every valid instance needs them.
When an overlay backs an optional action, expose both as explicit capabilities:

```tsx
<ActionsRoot>
  <ActionsMenu>
    {canDelete && <DeleteItem />}
  </ActionsMenu>
  {canDelete && <DeleteAlertDialog />}
</ActionsRoot>
```

Keep the overlay as a persistent sibling of transient content, but do not
silently mount it from the root. This keeps capability presence visible and
prevents omitted actions from leaving hidden feature state behind.

## Effects and synchronization

Use effects only for external synchronization:

- mirror changing root inputs into a persistent store;
- subscribe to an external service;
- coordinate focus when the primitive does not already handle it.

Do not use effects to derive renderable state or to implement event transitions
that belong in atomic actions.

Guard synchronization so it does not reset a user's in-progress interaction.

## IDs and instance safety

Use generated IDs or include stable resource identity in DOM IDs. Verify:

- two family instances do not share DOM IDs;
- opening one instance does not mutate another;
- an overlay remains bound to the correct resource after list reorder;
- external stores are disposed or become unreachable on unmount.
