# Async boundaries and adapters

Keep component composition separate from infrastructure and product policy.

## Contents

- [Server-state boundary](#server-state-boundary)
- [Lifecycle-safe side effects](#lifecycle-safe-side-effects)
- [Permission and capability adapters](#permission-and-capability-adapters)
- [Responsive adapters](#responsive-adapters)
- [Analytics and routing adapters](#analytics-and-routing-adapters)
- [Form and validation adapters](#form-and-validation-adapters)
- [Error and pending composition](#error-and-pending-composition)

## Server-state boundary

Domain items call repository feature hooks. They do not manipulate raw query
keys or a `QueryClient` when the feature exposes a cache facade.

For an optimistic mutation:

1. cancel every affected query representation;
2. snapshot every affected value;
3. update list, detail, aggregate, and scoped optimistic UI representations;
4. return a rollback context;
5. restore every snapshot and local state on failure;
6. reconcile or invalidate according to repository policy on settlement.

Updating only the visible list while leaving detail and aggregate caches stale
is a synchronization bug.

Keep mutation mechanics out of generic structural slots. A domain item or
focused controller can bind the mutation to a family action.

## Lifecycle-safe side effects

Run navigation, analytics, notifications, focus restoration, and closure at the
correct mutation stage:

- navigate only after confirmed success;
- preserve success behavior if transient content unmounts;
- emit resource identity and placement from root context;
- avoid duplicate notifications from both mutation and consumer layers;
- keep retry and error presentation consistent with repository conventions.

Use promise-based mutation flow or mutation-level callbacks when component
unmounting could discard observer callbacks.

## Permission and capability adapters

Generic roots should not decide permissions:

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

The adapter owns policy. The family owns coherent structure, styling, and state.
This keeps capability changes open for extension without modifying generic
internals.

Disable an action instead of hiding it only when the product needs to explain
why it is unavailable. Preserve tooltip and accessibility behavior through a
focused disabled-state component.

## Responsive adapters

If viewport changes the interaction primitive, compose an adapter:

```tsx
return compact
  ? <ResourceActionsSheet>{items}</ResourceActionsSheet>
  : <ResourceActionsDropdownMenu>{items}</ResourceActionsDropdownMenu>
```

Share domain items or action descriptors only when that abstraction remains
type-safe and accessible in both surfaces. A dropdown item and a sheet button
may need distinct base components even when they trigger the same domain action.

Do not put `isMobile` branches throughout generic slots.

## Analytics and routing adapters

Supply shared placement and resource data once at the root. Domain actions can
read it through a narrow hook. Prefer repository abstractions for:

- typed routes;
- analytics event names and payloads;
- notification messages;
- permission checks.

Do not hardcode infrastructure into base structural primitives.

## Form and validation adapters

Keep the family compatible with the repository's form library:

- preserve input `name`, `value`, `defaultValue`, `onChange`, `onBlur`, and refs;
- associate labels, descriptions, and errors with unique IDs;
- expose value-level callbacks rather than leaking internal DOM structure;
- keep schema validation and submit mutation outside purely visual field slots.

An adapter may bind a generic field family to React Hook Form or another form
controller. The base field should remain usable without that library when the
repository expects both modes.

## Error and pending composition

Expose semantic state through focused props or context:

- pending disables only unsafe duplicate actions;
- errors stay close to the action that can recover;
- optimistic state is distinguishable when product design requires it;
- retry remains a domain action, not a generic slot concern.

Avoid one family-wide `loading` boolean when independent actions can run
concurrently.
