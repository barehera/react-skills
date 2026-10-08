# Composition

API shapes behind the core contracts in `SKILL.md`. Copy the shape, not the
domain names.

## Contents

- [Open parts](#open-parts)
- [Consumer-mapped collection](#consumer-mapped-collection)
- [Root-owned collection](#root-owned-collection)
- [Required bindings after a spread](#required-bindings-after-a-spread)
- [Switches and modes](#switches-and-modes)
- [Feature adapters](#feature-adapters)
- [Names and JSX](#names-and-jsx)

## Open parts

A closed component that owns the map and hardcodes each item's anatomy exposes
no customization boundary:

```tsx
<ComboboxList>
  <ComboboxResults />
</ComboboxList>
```

Split it instead: the collection part owns enumeration and when items may
render; the item boundary owns the base primitive, selection, disabled rules,
and identity; the item's children own presentation. Apply the same test to
table rows, command results, tree nodes, cards, carousel slides, and sortable
items.

Structural slots own semantic layout; focused leaves own interaction logic,
accessibility labels, disabled rules, and state subscriptions; the consumer
owns presence and order. A header part that always renders a title,
description, and edit action closes the family to new capabilities. An inert
text span that consumers never omit, move, or customize needs no public part.

## Consumer-mapped collection

The consumer maps its own array. Identity is set once on the item, the root
takes only the IDs it needs for an aggregate (position and total here), and
the wording around the derived value is the consumer's:

```tsx
<Stepper
  value={activeStepId}
  onValueChange={setActiveStepId}
  stepIds={steps.map((step) => step.id)}
>
  <StepperList>
    {steps.map((step) => (
      <StepperItem key={step.id} value={step.id}>
        <StepperTrigger>
          <StepperPosition>
            {(position, total) => `Step ${position} of ${total}`}
          </StepperPosition>
          <StepperTitle>{step.title}</StepperTitle>
        </StepperTrigger>
      </StepperItem>
    ))}
  </StepperList>
  <StepperPrevious>Back</StepperPrevious>
  <StepperNext>Continue</StepperNext>
</Stepper>
```

`StepperItem` provides its `value` through a small item context;
`StepperPosition` and `StepperTrigger` read it and derive position and the
active state during render, so reordering `steps` cannot leave a stale index.

## Root-owned collection

When the family gates loading, error, and empty states, the root receives the
array once and a collection part enumerates it through a render callback:

```tsx
<Combobox
  items={results}
  value={value}
  onValueChange={setValue}
  query={query}
  onQueryChange={setQuery}
  loading={isPending}
  error={error}
>
  <ComboboxTrigger>{selectedLabel}</ComboboxTrigger>
  <ComboboxContent>
    <ComboboxInput placeholder="Search" />
    <ComboboxList>
      <ComboboxLoading>Searching</ComboboxLoading>
      <ComboboxError>Results unavailable</ComboboxError>
      <ComboboxEmpty>No results</ComboboxEmpty>
      <ComboboxCollection>
        {(item) => (
          <ComboboxItem key={item.id} value={item.id}>
            <ComboboxItemLabel>{item.label}</ComboboxItemLabel>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxCollection>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

`ComboboxCollection` renders nothing while loading, failed, or empty, so no
consumer repeats `!loading && !error && items.map(...)`. It is generic over the
item type (`ComboboxCollection<T>` with a typed render callback), and any cast
stays inside the family, so consumers never write `as`. The loading, error,
and empty parts stay focused and independently replaceable.

A root-owned collection is an ownership boundary, not a convenience. Do not
hoist an array to the root because a future requirement might need these
behaviors. That rejects speculation, a need with no record. A consumer named in
a roadmap, backlog, plan, design, or sibling screen with the same shape is a
concrete requirement.

## Required bindings after a spread

The consumer's props are spread first, its handler runs before the family's,
and the binding the family depends on is applied last:

```tsx
function ComboboxInput({
  className,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  const combobox = useCombobox("ComboboxInput")

  return (
    <CommandInput
      data-slot="combobox-input"
      className={cn("h-9", className)}
      {...props}
      value={combobox.query}
      onValueChange={(query) => {
        onValueChange?.(query)
        combobox.onQueryChange(query)
      }}
    />
  )
}
```

## Switches and modes

A root such as `<ResourceActions showShare showDelete mobileSheet canMove />`
is a product-rule switchboard. A boolean prop is appropriate only when it
changes one cohesive behavior of the component rather than selecting
children.

The same applies to leftover `phase`, `mode`, or `layout` props. When the
consumer already expresses the mode by swapping, omitting, or reordering
slots, do not also label the root unless descendants need that value for
shared behavior or styling. A family-wide `variant="pill"` remains valid.

## Feature adapters

The feature adapter evaluates permissions and policy and composes or omits
each capability; a generic root never decides who may act.

When the viewport changes the interaction primitive, such as a dropdown menu
on desktop and a sheet on mobile, the adapter renders one surface or the other
instead of spreading `isMobile` branches through generic slots. Responsive CSS
inside a slot is fine when it is intrinsic to that slot's layout.

## Names and JSX

- When a collection and its row would differ only by plural, name the roles:
  `ResourceCardItemList` and `ResourceCardItemListItem` (or `Menu` and
  `MenuItem`), not `ResourceCardItems` and `ResourceCardItem`.
- A part whose element the consumer may need to swap, such as a link for a
  button, takes `asChild` and renders `Slot.Root` from `radix-ui`, as the
  shadcn `Button` does, instead of an `as` or `href` prop. Layout-only parts
  such as a card header or `ul` need no polymorphism.
- Render an optional branch as `condition && <Component />` with a boolean
  condition; compare nullable values explicitly (`src != null &&`,
  `items.length > 0 &&`) because `0` renders as text. Use a ternary only when
  both branches render UI.
- With React Compiler enabled, write direct values and functions; do not add
  `useMemo`, `useCallback`, or `React.memo` for routine render optimization or
  context-value stability.
