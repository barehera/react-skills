# Architecture and public API

Use this reference to design the component family before writing JSX.

## Contents

- [Start from responsibilities](#start-from-responsibilities)
- [Dependency direction](#dependency-direction)
- [Define the family model](#define-the-family-model)
- [Design complete composition boundaries](#design-complete-composition-boundaries)
- [Supply item identity once](#supply-item-identity-once)
- [Pass shared inputs once](#pass-shared-inputs-once)
- [Preserve substitution](#preserve-substitution)
- [Prefer composition to switches](#prefer-composition-to-switches)
- [File boundaries](#file-boundaries)

## Start from responsibilities

A reusable family can contain:

- **Root**: instance boundary, provider, genuinely shared configuration and
  state scope, plus required persistent siblings. It is not a bag for every
  slot's copy, actions, or presentational data.
- **Structural slots**: trigger, list, content, header, body, footer, group,
  row, or field.
- **Base item**: invariant interaction and presentation shared by domain items.
- **Domain item**: one product action or focused presentation.
- **Overlay**: dialog, alert dialog, sheet, popover, or workflow that must remain
  mounted independently of transient content.
- **Adapter**: composition that bridges permissions, viewport, routing,
  analytics, or server state without teaching generic slots those policies.

Not every family needs every layer. A two-component wrapper should stay simple.

## Dependency direction

Prefer this direction:

```text
consumer adapter
  -> domain items
    -> family slots and hooks
      -> repository design-system primitives

domain items
  -> feature hooks and cache facade
    -> transport
```

Generic family slots must not import feature-specific permissions, routes,
analytics events, endpoints, or raw query keys.

## Define the family model

Before implementation, answer:

1. What data describes the whole instance?
2. Which slots must share configuration or state?
3. Which pieces are invariant structure?
4. Which differences belong to consumer composition?
5. Which children may unmount while an action continues?
6. Which API additions are likely: another item, slot, size, variant, overlay,
   permission, viewport, or async action?

Use the answers to sketch the public composition:

```tsx
<ResourceActions resource={resource} size="lg">
  <ResourceActionsTrigger />
  <ResourceActionsContent>
    <ResourceActionsShareItem />
    {canMove && <ResourceActionsMoveItem />}
    <ResourceActionsDeleteItem />
  </ResourceActionsContent>
</ResourceActions>
```

The root supplies instance data and shared semantics. The consumer chooses
capability and ordering.

## Design complete composition boundaries

Treat the family as a set of structural slots and focused logic-bearing items.
A consumer must be able to omit, reorder, wrap, separate, or conditionally
render every independently optional capability without editing an internal
component.

Keep anatomy separate from enumeration. When the call site already owns a
presentational array, consumer `.map()` is the default. A structural list slot
owns layout or list semantics, while the consumer owns enumeration and each
item's visible anatomy:

```tsx
<ResourceCardItemList>
  {items.map((item) => (
    <ResourceCardItemListItem key={item.id} status={item.status}>
      <ResourceCardItemTitle>{item.title}</ResourceCardItemTitle>
    </ResourceCardItemListItem>
  ))}
</ResourceCardItemList>
```

Move a collection to the root only when the family must coordinate a controlled
snapshot, virtualization, sorting, or cohesive loading, error, and empty
gating. Then pass it once and make the collection boundary enumerate through a
render callback so the consumer still owns returned item anatomy.

A controlled mutable workflow is one such exception:

```tsx
<ApprovalWorkflowRoot steps={steps} onStepsChange={setSteps}>
  <ApprovalWorkflowStepCollection>
    {(step) => (
      <ApprovalWorkflowStep key={step.id} stepId={step.id}>
        {/* independently composable step slots and actions */}
      </ApprovalWorkflowStep>
    )}
  </ApprovalWorkflowStepCollection>
</ApprovalWorkflowRoot>
```

This is an ownership boundary, not a convenience render prop. The root owns the
accepted controlled snapshot, so internal enumeration prevents its
`Collection` from drifting to a second array. The same exception applies when a
family owns remote-result gating or virtualization. Do not hoist an array to
the root merely because a future requirement might need those behaviors.

Consumer mapping also remains correct when a page renders independent roots:

```tsx
{tasks.map((task) => (
  <TaskActionsRoot key={task.id} task={task}>
    {/* one isolated family instance */}
  </TaskActionsRoot>
))}
```

Do not mix the modes. When a family does own a collection, never pass `items`
to its root and then read the same external `items` solely to enumerate that
root's item boundaries.

Do not replace the render prop with a closed `Results` component that still
owns the map and hardcodes each item's visible anatomy:

```tsx
<ReviewerPickerList>
  <ReviewerPickerResults />
</ReviewerPickerList>
```

That API exposes neither item presentation nor a customization boundary. When
the picker root already owns the reviewers, let the items boundary own cohesive
enumeration and loading, error, and empty gating while exposing each reviewer
to consumer markup:

```tsx
<ReviewerPickerList>
  <ReviewerPickerLoading />
  <ReviewerPickerError />
  <ReviewerPickerEmpty />
  <ReviewerPickerItems>
    {(reviewer) => (
      <ReviewerPickerItem key={reviewer.id} reviewerId={reviewer.id}>
        <ReviewerPickerItemIndicator />
        <ReviewerPickerItemContent>
          <ReviewerPickerItemName>
            {reviewer.name}
          </ReviewerPickerItemName>
          <ReviewerPickerItemDescription>
            {reviewer.description}
          </ReviewerPickerItemDescription>
        </ReviewerPickerItemContent>
      </ReviewerPickerItem>
    )}
  </ReviewerPickerItems>
</ReviewerPickerList>
```

`ReviewerPickerItems` owns enumeration and the rule for when valid results may
render, but it does not choose their anatomy. The reviewer collection is passed
only once, at the root. The item boundary owns the base interactive primitive,
selection behavior, disabled rules, and stable identity. Its children own
presentation. Consumers can omit the indicator, replace the description, add
a badge, or reorder the anatomy without reimplementing picker behavior. Apply
the same test to table rows, command results, tree nodes, cards, carousel slides,
and sortable items.

Prefer:

```tsx
<ApprovalWorkflowStep stepId={step.id}>
  <ApprovalWorkflowStepHeader>
    <ApprovalWorkflowStepTitle>
      <ApprovalWorkflowStepPosition />
      <ApprovalWorkflowStepName>{step.name}</ApprovalWorkflowStepName>
    </ApprovalWorkflowStepTitle>
    <ApprovalWorkflowStepHeaderActions>
      <ApprovalWorkflowStepEditButton />
    </ApprovalWorkflowStepHeaderActions>
  </ApprovalWorkflowStepHeader>
  <ApprovalWorkflowStepControls>
    <ApprovalWorkflowStepRequiredField />
    <ApprovalWorkflowStepControlActions>
      <ApprovalWorkflowStepMoveUpButton />
      <ApprovalWorkflowStepMoveDownButton />
      {canRemove && <ApprovalWorkflowStepRemoveButton />}
    </ApprovalWorkflowStepControlActions>
  </ApprovalWorkflowStepControls>
</ApprovalWorkflowStep>
```

Avoid a `StepHeader` that always renders title, description, and edit action or
a `StepControls` that always renders a field and every action. Those components
look concise at one call site but make the family closed to product policy,
responsive placement, separators, alternate layouts, and future capabilities.

The structural slots above may own semantic layout and base-primitive mapping.
The focused leaves own their interaction logic, accessibility labels, disabled
rules, and state subscriptions. The consumer owns presence and order. Split at
independent change boundaries; do not turn every inert text span into a public
component when it cannot reasonably be omitted, moved, or customized.

Logic-bearing domain items should forward compatible primitive props and use
their `children` as the presentation override. Default icon-and-label content
is acceptable only as a fallback. Do not force a consumer to duplicate the
item's mutation or selection logic merely to change its visible content.

Each public part should render one primitive or one DOM role. Do not wrap a
title primitive in a second text primitive solely to spread another prop type:

```tsx
// Previous: two primitives compete for one public part and force an inner node.
function ResourceCardTitle({ children, ...props }: TextProps) {
  return (
    <CardTitle>
      <Text asChild {...props}>
        <span>{children}</span>
      </Text>
    </CardTitle>
  )
}

// Improved: one public part is one primitive; required wiring wins after props.
function ResourceCardTitle({ className, children, ...props }: TextProps) {
  const { titleId } = useResourceCard()

  return (
    <Text
      data-slot="resource-card-title"
      className={cn("font-semibold", className)}
      {...props}
      id={titleId}
    >
      {children}
    </Text>
  )
}
```

Keep `asChild`, Base UI `render`, or equivalent polymorphism available when the
chosen primitive supports it, but let the consumer opt in. Do not force
`asChild` or add an extra element to layout-only parts such as a card header or
`ul`.

### Supply item identity once

For collections, put the stable item identity on the nearest item boundary and
make nested leaves resolve the item through that boundary:

```tsx
<ApprovalWorkflowStep stepId={step.id}>
  <ApprovalWorkflowStepPosition />
  <ApprovalWorkflowStepMoveDownButton />
</ApprovalWorkflowStep>
```

`ApprovalWorkflowStepPosition` and `ApprovalWorkflowStepMoveDownButton` should
derive the current index from the collection using `stepId`. Do not require
`index={index}` on every descendant. An index is positional state, becomes stale
after reordering, and is not item identity. Use a small item context for stable
transport, or store the identity in a scoped item boundary while reactive leaves
subscribe to only the state slices they need.

## Pass shared inputs once

Put only cohesive values that several parts need to coordinate on the root:

- controlled family state such as `open`, `value`, `onOpenChange`, or
  `onValueChange`;
- family size, variant, density, or tone;
- a domain resource used by several behavioral parts;
- stable placement or analytics source used across the instance;
- generated IDs and other accessibility or state wiring.

Prefer:

```tsx
<ResourceActions resource={resource} project={project} source="header" />
```

Avoid passing `resourceId`, `projectId`, `projectName`, and `source` through
every behavioral child when they describe the same instance. Use a smaller
object type only when the family intentionally supports multiple domain models.

Displayed copy belongs to the part that renders it:

```tsx
<ResourceCard>
  <ResourceCardTitle>{title}</ResourceCardTitle>
</ResourceCard>
```

Context may carry `titleId` so the root and title agree; it must not carry
`title`. Likewise, `disabled`, loading, and click handlers belong to the action
that can vary independently:

```tsx
<ResourceCardFooter>
  <ResourceCardCancel onClick={onCancel} />
  <ResourceCardConfirm
    disabled={locked}
    isLoading={pending}
    onClick={onConfirm}
  />
</ResourceCardFooter>
```

A root lock is appropriate only when it is truly family-wide, such as a
fieldset policy. Shared state setters such as `onOpenChange` stay on the root.
Do not put a presentational array on the root unless the family owns one of the
collection behaviors described above.

## Preserve substitution

For every extended primitive, inventory:

- exported prop type and ref target;
- controlled and uncontrolled props;
- event handlers and event ordering;
- `asChild` or polymorphic support;
- ARIA, roles, focus, dismissal, and keyboard behavior;
- base variants, sizes, defaults, data attributes, and CSS variables;
- portal, collision, modal, and responsive behavior.

Spread compatible props, merge `className`, forward refs using the repository's
React convention, and compose handlers without erasing user handlers.

Apply required internal bindings after the consumer spread. Generated IDs and
controlled `value` or `open` must not be replaceable when doing so breaks
family wiring. Keep consumer `className` last in `cn(...)`; compose
observational event handlers instead of silently replacing them.

An extended trigger should still be usable where the base trigger is expected.
If the extension deliberately narrows the contract, give it a domain-specific
name and document the difference.

## Prefer composition to switches

Avoid roots such as:

```tsx
<ResourceActions
  showShare
  showDelete
  mobileSheet
  canMove
  destructiveLast
/>
```

Those props turn the root into a product-rule switchboard. Prefer slots and
focused adapters. A boolean is appropriate when it changes one cohesive
behavior of the component rather than selecting arbitrary children.

The same applies to leftover `phase`, `mode`, or `layout` props. When the
consumer already expresses the mode by swapping, omitting, or reordering slots,
do not also label the root unless descendants actually need that value for
shared behavior or styling. A family-wide `variant="pill"` remains valid.

## Keep names honest

Use names that reveal the underlying family and role:

- `ResourceDropdownMenu`
- `ResourceDropdownMenuTrigger`
- `ResourceDropdownMenuContent`
- `ResourceDropdownMenuItem`

Short aliases are acceptable only when a local namespace or export pattern
makes the base primitive unambiguous.

When a public collection and row would differ only by plural, name the roles:
prefer `ResourceCardItemList` and `ResourceCardItemListItem` (or `Menu` and
`MenuItem`) over `ResourceCardItems` and `ResourceCardItem`. Keep domain leaf
names such as `ResourceCardItemTitle` on the leaf. Established families such
as `Tabs` and `TabsTrigger` are not plural-only collection/row pairs.

## File boundaries

Default to one discoverable shadcn-style file for a cohesive public family. Keep
its root, context or scoped-store plumbing, structural slots, base items,
focused domain items, and persistent overlays together when they form one API.
File length alone is not a reason to scatter the family.

Split only by a real change boundary:

- separate a domain item only when it has independent reuse, ownership,
  dependencies, or tests;
- keep server-state code in the feature's established server-state layer;
- keep transports, cache facades, schemas, and unrelated adapters outside the
  component file;
- avoid barrels unless the repository already uses them as stable public APIs.

A long cohesive family is preferable to one file per root, context, menu,
item, and overlay. Consumers should be able to discover the complete public API
from one module, as they do with repository-native shadcn primitives.
