# Variants and styling

Use this reference whenever a component family extends styled primitives.

## Contents

- [The ownership rule](#the-ownership-rule)
- [Prefer the CSS propagation ladder](#prefer-the-css-propagation-ladder)
- [Preserve base styles and defaults](#preserve-base-styles-and-defaults)
- [Model a family variant matrix](#model-a-family-variant-matrix)
- [Promote semantics, keep layout local](#promote-semantics-keep-layout-local)
- [Structure long class lists](#structure-long-class-lists)
- [Avoid leaf sizing patches](#avoid-leaf-sizing-patches)
- [Root defaults and child overrides](#root-defaults-and-child-overrides)
- [Extend the base or the family](#extend-the-base-or-the-family)
- [Variant implementation pattern](#variant-implementation-pattern)
- [Maintenance audit](#maintenance-audit)

## The ownership rule

The family root owns semantic configuration. Each slot owns its rendering.

```tsx
<Tabs size="lg" variant="line">
  <TabsList>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="activity" />
</Tabs>
```

`Tabs` puts `size` and `variant` on its element as data attributes or CSS
variables. `TabsList`, `TabsTrigger`, and `TabsContent` read them through named
group selectors or inherited variables. Consumers do not repeat `size="lg"` on
every slot, and a visual-only change does not re-render through React context.

## Prefer the CSS propagation ladder

Choose the first mechanism that fits:

1. Direct root styles in the root's merged `className`.
2. `data-size`, `data-variant`, or another semantic attribute on the root, read
   through a named group such as `group/card` with descendant
   `group-data-[size=sm]/card:*` selectors.
3. Inherited CSS variables on the root when several slots share a token such as
   spacing, height, radius, or color.
4. A class or variant prop passed directly when the connected part is portaled
   or not a DOM descendant. For a portaled `SelectContent`, a small React
   context may carry the root size; trigger and content map the same value to
   different slot styles.
5. React context only when JavaScript behavior, not only CSS, must read the
   value.

`className` stays the extension surface, data attributes describe state, named
groups connect descendants, and CSS variables distribute shared tokens.

## Preserve base styles and defaults

Before extending a primitive, record its variants, sizes, defaults, CSS
variables, data attributes, state selectors, class merge order, icon and text
selectors, and responsive or orientation behavior. Support the base values
unless a narrowing is documented; with family props omitted, the base visual
contract holds.

Do not copy today's generated class string into a wrapper and treat it as the
contract. Reuse or extend the base variant definition when it is exported.
When it is not, keep the wrapper narrow and test it against the base.

## Model a family variant matrix

Define the semantic values first, then map each one per connected slot:

```ts
type FamilySize = "sm" | "default" | "lg"
type FamilyVariant = "default" | "line"
```

| Input | List | Trigger | Content |
| --- | --- | --- | --- |
| `size="sm"` | compact gap/radius | compact target/type/icon | compact inset |
| `size="default"` | base contract | base contract | base contract |
| `size="lg"` | larger container rhythm | larger target/type/icon | larger inset |
| `variant="line"` | line container treatment | active underline | line spacing |

Not every slot needs a class for every value, but every slot receives the same
semantic input so later changes stay coherent. Use one shared family input
type; a slot may have its own CVA because a trigger and a list express `lg`
differently.

## Promote semantics, keep layout local

If the repository already has `Card`, `Alert`, `Empty`, `Item`, `Field`, or a
matching primitive, compose it instead of recreating its border, background,
radius, and padding on a raw element. A raw `div` remains right for layout-only
grid, flex, width, alignment, or spacing wrappers.

Create a typed variant when a style difference repeats across consumers,
affects several connected slots, names a design-system concept, or changes
target, typography, icon, spacing, or state styling as one mode. Keep
`className` at the consumer for page layout, grid placement, width, margin,
alignment, or a one-off composition. `className="w-full md:w-auto"` is consumer
layout; `size="lg"` is family semantics.

## Structure long class lists

Keep a short class list as one string. When a component mixes base layout,
interaction states, descendant selectors, themes, or several semantic variants,
split it into ordered strings passed to the repository's merge utility, grouped
by responsibility:

```tsx
<CardFooter
  className={cn(
    "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
    "group-data-[variant=primary]/card:border-primary-foreground/20 group-data-[variant=primary]/card:bg-primary-foreground/10",
    "group-data-[variant=destructive]/card:border-destructive/20 group-data-[variant=destructive]/card:bg-destructive/10",
    className
  )}
/>
```

```tsx
className={cn(
  "inline-flex items-center rounded-lg text-sm transition-colors outline-none",
  "hover:bg-muted active:bg-muted/80",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  className
)}
```

- Base layout and default appearance come first; consumer `className` comes
  last.
- One group per state or semantic variant; separate hover, focus, disabled,
  invalid, dark, responsive, and family variants when the combined string gets
  hard to scan.
- Keep conflict-sensitive groups in their intended order, because later
  conflicting classes win.
- Do not split every utility into its own string or move one-use groups into
  distant constants; the grouping should reveal the style model at the call
  site.

Use an array form only when the repository's CVA or class utility accepts it,
and check that formatting or class sorting does not recombine the groups.

## Avoid leaf sizing patches

```tsx
<TabsTrigger className="min-h-10 px-4 text-base" />
```

This bypasses the family API, may conflict with the list container, and must
be repeated for every trigger. Add `size="lg"` to the root and map `lg` across
the connected slots. Scope icon and text selectors to the slot's documented
structure so they do not resize unrelated nested elements.

## Root defaults and child overrides

The root value is the default for every connected slot. Add a child override
only for a real composition that needs it:

```tsx
<Toolbar size="lg">
  <ToolbarButton size="sm" aria-label="Dismiss" />
</Toolbar>
```

The override is explicit, typed, and local: an escape hatch, not normal usage.
Avoid separate uncontrolled style contexts per child.

## Extend the base or the family

Add a variant to the base primitive when it is domain-neutral, useful across
unrelated features, and compatible with the primitive's semantics. Keep it in
the feature family when it represents product semantics or depends on feature
context. `size="lg"` may belong on the base `SelectTrigger`; a
`review-state="blocked"` appearance belongs to a reviewer workflow.

## Variant implementation pattern

```tsx
function Family({ size = "default", className, ...props }: FamilyProps) {
  return (
    <div
      data-size={size}
      className={cn(
        "group/family [--family-space:--spacing(3)]",
        "data-[size=sm]:[--family-space:--spacing(2)]",
        "data-[size=lg]:[--family-space:--spacing(4)]",
        className
      )}
      {...props}
    />
  )
}

function FamilyItem({ className, ...props }: ItemProps) {
  return (
    <div
      className={cn(
        "gap-(--family-space) px-(--family-space)",
        "group-data-[size=lg]/family:text-base",
        className
      )}
      {...props}
    />
  )
}
```

- `data-slot` identifies parts for styling and tooling; a named group avoids
  coupling to an unrelated ancestor group.
- One inherited CSS variable beats parallel group selectors when several slots
  share a spacing token.
- Leave the default branch unchanged when the base primitive already owns it.
- Merge base primitive styles, then family slot styles, then consumer
  `className`, through the repository's merge utility.

For a supported local override, put an optional data attribute or CSS variable
on that slot and apply inherited root selectors only when it is absent; do not
rely on CSS source order to resolve the conflict. Do not use `cloneElement` to
push styling props into arbitrary children; it breaks with fragments, portals,
render props, and user components.

## Maintenance audit

When the base primitive changes, compare its prop and variant types, default
styles, and state selectors; confirm the family default still matches and root
values reach every connected slot; test one child override; and visually check
the full size and variant matrix.
