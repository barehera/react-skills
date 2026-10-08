# Architecture and public API

Design the family's public composition before writing JSX. Complete call-site
shapes live in [examples.md](examples.md); this file explains the rules behind
them.

## Contents

- [Start from responsibilities](#start-from-responsibilities)
- [Design complete composition boundaries](#design-complete-composition-boundaries)
- [Supply item identity once](#supply-item-identity-once)
- [Pass shared inputs once](#pass-shared-inputs-once)
- [Give each part its own props](#give-each-part-its-own-props)
- [Preserve substitution](#preserve-substitution)
- [Prefer composition to switches](#prefer-composition-to-switches)
- [Keep names honest](#keep-names-honest)
- [JSX and element conventions](#jsx-and-element-conventions)

## Start from responsibilities

Generic slots never import feature permissions, routes, analytics events,
endpoints, or raw query keys; domain items reach those through feature hooks.

Not every family needs every layer. A two-component wrapper should stay simple.
That guides creating a family; it does not license removing parts from an
existing family during an audit (see
[Judge over-engineering](review-and-testing.md#judge-over-engineering)).

## Design complete composition boundaries

A consumer must be able to omit, reorder, wrap, separate, or conditionally
render every independently optional capability without editing an internal
component.

Keep anatomy separate from enumeration. When the call site owns a
presentational array, the consumer maps it inside a structural list slot (see
[the open card](examples.md#open-composition-and-presentational-collection)).
This also holds when a page renders one independent root per record.

Move a collection to the root only when the family coordinates a controlled
snapshot, virtualization, sorting, or cohesive loading, error, and empty
gating. Pass it once and enumerate through a render callback, as in
[the controlled workflow](examples.md#root-owned-controlled-collection). That
is an ownership boundary, not a convenience render prop: internal enumeration
keeps the collection from drifting to a second array. Do not hoist an array to
the root merely because a future requirement might need those behaviors.
That rejects speculation, a need with no record. A consumer named in a
roadmap, backlog, plan, design, or sibling screen with the same shape is a
concrete requirement. When auditing an existing family, judge its parts with
[Judge over-engineering](review-and-testing.md#judge-over-engineering).

Do not mix the modes: never pass `items` to the root and then read the same
external `items` to enumerate that root's item boundaries.

A closed results component that owns the map and hardcodes each item's anatomy
exposes no customization boundary:

```tsx
<ComboboxList>
  <ComboboxResults />
</ComboboxList>
```

Instead, the items boundary owns enumeration and the rule for when results may
render, the item boundary owns the base primitive, selection, disabled rules,
and identity, and the item's children own presentation (see
[the remote result picker](examples.md#remote-result-collection)). Consumers
can then omit the indicator, replace the description, or add a badge without
reimplementing picker behavior. Apply the same test to table rows, command
results, tree nodes, cards, carousel slides, and sortable items.

Avoid a `StepHeader` that always renders title, description, and edit action,
or a `StepControls` that always renders a field and every action. They look
concise at one call site but close the family to product policy, responsive
placement, separators, and new capabilities. Structural slots own semantic
layout; focused leaves own interaction logic, accessibility labels, disabled
rules, and state subscriptions; the consumer owns presence and order. Split at
independent change boundaries; do not turn every inert text span into a public
component when it cannot reasonably be omitted, moved, or customized.

Logic-bearing items forward compatible primitive props and treat `children` as
the presentation override. A default icon and label is a fallback, not the only
presentation; consumers must not duplicate mutation or selection logic to
change visible content.

Each public part renders one primitive. Do not wrap a title primitive in a
second text primitive to spread another prop type:

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

Keep `asChild`, Base UI `render`, or equivalent polymorphism available when
the primitive supports it, but let the consumer opt in. Layout-only parts such
as a card header or `ul` need no forced polymorphism or extra element.

## Supply item identity once

Put stable identity on the nearest item boundary:

```tsx
<ApprovalWorkflowStep stepId={step.id}>
  <ApprovalWorkflowStepPosition />
  <ApprovalWorkflowStepMoveDownButton />
</ApprovalWorkflowStep>
```

`ApprovalWorkflowStepPosition` and `ApprovalWorkflowStepMoveDownButton` derive
the current index from the collection using `stepId`. An `index={index}` prop
on every descendant is positional state, goes stale after reordering, and is
not identity. Use a small item context for stable transport, or store the
identity in a scoped item boundary while reactive leaves subscribe to the
slices they need.

## Pass shared inputs once

The root takes the values several parts coordinate: controlled state and its
setters (`open`, `onOpenChange`, `value`, `onValueChange`), family size,
variant, density, or tone, a domain resource used by several behavioral parts,
a stable placement or analytics source, and generated IDs.

```tsx
<ResourceActions resource={resource} project={project} source="header" />
```

Do not pass `resourceId`, `projectId`, `projectName`, and `source` through
every behavioral child when they describe the same instance. Use a smaller
object type only when the family intentionally supports several domain models.
A root lock is appropriate only when it is family-wide, such as a fieldset
policy.

## Give each part its own props

Let each slot accept its primitive's props directly:

```tsx
<ResourcePicker resource={resource}>
  <ResourcePickerLabel className="sr-only">Resource</ResourcePickerLabel>
  <ResourcePickerTrigger variant="outline" size="sm">
    <ResourcePickerValue placeholder="Choose a resource" />
  </ResourcePickerTrigger>
  <ResourcePickerContent align="start" sideOffset={6}>
    <ResourcePickerItem value="one">One</ResourcePickerItem>
  </ResourcePickerContent>
</ResourcePicker>
```

Not through root prop bags:

```tsx
<ResourcePicker
  triggerProps={{ variant: "outline", size: "sm" }}
  contentProps={{ align: "start", sideOffset: 6 }}
  itemProps={{ className: "..." }}
/>
```

Bags hide the composition boundary, make types harder to discover, and force
the root to proxy every future primitive prop. A convenience component may
compose the slots for the common case; build it from the same slots so
behavior, accessibility, and defaults cannot drift.

## Preserve substitution

Inventory each extended primitive: prop type and ref target, controlled and
uncontrolled props, event ordering, `asChild` or polymorphism, ARIA, focus,
dismissal, keyboard, base variants and defaults, data attributes, CSS
variables, and portal or collision behavior.

Generated IDs and controlled `value` or `open` must not be replaceable by a
consumer spread when that breaks family wiring. Keep consumer `className` last
in `cn(...)`, and compose observational handlers instead of replacing them.

An extended trigger should still work where the base trigger is expected. If
the extension deliberately narrows the contract, give it a distinct name
and document the difference.

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
do not also label the root unless descendants need that value for shared
behavior or styling. A family-wide `variant="pill"` remains valid.

## Keep names honest

Names reveal the underlying family and role: `Stepper`, `StepperItem`,
`StepperTrigger`, `StepperContent`. Short aliases are acceptable only when a local
namespace makes the base primitive unambiguous.

When a collection and its row would differ only by plural, name the roles:
prefer `ResourceCardItemList` and `ResourceCardItemListItem` (or `Menu` and
`MenuItem`) over `ResourceCardItems` and `ResourceCardItem`. Domain leaf names
such as `ResourceCardItemTitle` stay on the leaf. Established families such as
`Tabs` and `TabsTrigger` are not plural-only pairs.

## JSX and element conventions

- Render an optional branch as `condition && <Component />` with a boolean
  condition; compare nullable values explicitly (`src != null &&`,
  `items.length > 0 &&`) because `0` renders as text. Use a ternary only when
  both branches render UI.
- With React Compiler enabled, write direct values and functions; do not add
  `useMemo`, `useCallback`, or `React.memo` for routine render optimization or
  context-value stability.
