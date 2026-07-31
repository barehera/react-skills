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

- **Root**: instance boundary, provider, shared configuration, state scope, and
  required persistent siblings.
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

Keep anatomy separate from enumeration. Whenever the family root receives a
collection, pass that collection once and make its collection slot enumerate
through a render callback. The family owns enumeration and cohesive state
policy; the consumer owns the returned item's visible anatomy.

Use the same contract for a controlled mutable workflow:

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

This is an ownership boundary, not a convenience render prop. The root already
owns the accepted controlled snapshot. Keeping enumeration inside the family
prevents its `Collection` from drifting to a second array and lets that boundary
add virtualization, sorting, or loading/error/empty gating later without
closing item presentation.

Use a consumer `.map()` only when the family root does not receive the
collection. A page that renders several independent action roots is the
canonical case:

```tsx
{tasks.map((task) => (
  <TaskActionsRoot key={task.id} task={task}>
    {/* one isolated family instance */}
  </TaskActionsRoot>
))}
```

Do not mix these modes. Never pass `items` to one family root and then read the
same external `items` solely to enumerate that root's item boundaries.

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
          <ReviewerPickerItemName />
          <ReviewerPickerItemDescription />
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
      <ApprovalWorkflowStepName />
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

Put cohesive shared values on the root:

- domain resource and related objects;
- placement or analytics source;
- disabled or read-only policy;
- family size, variant, density, or tone;
- callbacks that apply to the entire instance.

Prefer:

```tsx
<ResourceActions resource={resource} project={project} source="header" />
```

Avoid passing `resourceId`, `projectId`, `projectName`, `source`, and `disabled`
through every child. Use a smaller object type only when the family intentionally
supports multiple domain models.

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

## Keep names honest

Use names that reveal the underlying family and role:

- `ResourceDropdownMenu`
- `ResourceDropdownMenuTrigger`
- `ResourceDropdownMenuContent`
- `ResourceDropdownMenuItem`

Short aliases are acceptable only when a local namespace or export pattern
makes the base primitive unambiguous.

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
