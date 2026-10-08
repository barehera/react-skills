# Async boundaries and adapters

Keep component composition separate from infrastructure and product policy.

## Contents

- [Server-state boundary](#server-state-boundary)
- [Lifecycle-safe side effects](#lifecycle-safe-side-effects)
- [Permission and capability adapters](#permission-and-capability-adapters)
- [Responsive adapters](#responsive-adapters)
- [Pending and error composition](#pending-and-error-composition)

## Server-state boundary

Domain items call feature hooks; they do not touch raw query keys or a
`QueryClient` when the feature exposes a cache facade. Keep mutation mechanics
out of generic structural slots; a domain item or focused controller binds the
mutation to a family action
([example](../examples/layered-family)).

The optimistic update must cancel, snapshot, update, roll back, and reconcile
every affected representation: list, detail, aggregate, and scoped optimistic
UI. Updating only the visible list is a synchronization bug. This skill decides
where the optimistic boundary sits; `$manage-server-state` owns the hook and
cache code.

## Lifecycle-safe side effects

- Navigate only after confirmed success.
- Menu or sheet content may unmount before a mutation settles, discarding
  observer callbacks. Use the `mutateAsync` promise or mutation-level callbacks
  so success behavior survives.
- Emit resource identity and placement from root context.
- Notify from one layer only, and keep retry and error presentation consistent
  with the repository.

## Permission and capability adapters

Generic roots do not decide permissions. The feature adapter does:

```tsx
function ResourceActionsForProject({ resource, policy }: Props) {
  return (
    <ResourceActions resource={resource}>
      <ResourceActionsTrigger />
      <ResourceActionsContent>
        {policy.canShare(resource) && <ShareItem />}
        {policy.canDelete(resource) && <DeleteItem />}
      </ResourceActionsContent>
    </ResourceActions>
  )
}
```

Disable an action instead of hiding it only when the product must explain why
it is unavailable, and keep its tooltip and accessibility behavior through a
focused disabled-state component.

## Responsive adapters

When viewport changes the interaction primitive, compose an adapter instead of
spreading `isMobile` branches through generic slots:

```tsx
return compact
  ? <ResourceActionsSheet>{items}</ResourceActionsSheet>
  : <ResourceActionsDropdownMenu>{items}</ResourceActionsDropdownMenu>
```

Share domain items or action descriptors only when they stay type-safe and
accessible in both surfaces; a dropdown item and a sheet button may need
distinct base components for the same domain action. Responsive CSS inside a
slot is fine when it is intrinsic to that slot's layout rather than choosing
capability or interaction semantics.

## Pending and error composition

Pending state disables only unsafe duplicate actions, and errors stay close to
the action that can recover. A confirm dialog's action calls
`event.preventDefault()`, stays disabled while its mutation is pending, and
closes on success, even for optimistic mutations. If the optimistic update
unmounts the item that hosts the dialog, report the failure from a parent that
survives instead of hoisting one shared dialog above the items, which would
detach it from each item's capability check. Avoid one family-wide `loading`
boolean when independent actions can run concurrently. Retry is a domain
action, not a generic slot concern.
