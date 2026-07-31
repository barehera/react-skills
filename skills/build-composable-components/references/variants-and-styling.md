# Variants and styling

Use this reference whenever a component family extends styled primitives.

## Contents

- [The ownership rule](#the-ownership-rule)
- [Prefer the CSS propagation ladder](#prefer-the-css-propagation-ladder)
- [Preserve base styles and defaults](#preserve-base-styles-and-defaults)
- [Model a family variant matrix](#model-a-family-variant-matrix)
- [Promote semantics, keep layout local](#promote-semantics-keep-layout-local)
- [Avoid leaf sizing patches](#avoid-leaf-sizing-patches)
- [Root defaults and child overrides](#root-defaults-and-child-overrides)
- [Extend the base or the family](#extend-the-base-or-the-family)
- [Variant implementation pattern](#variant-implementation-pattern)
- [Responsive behavior](#responsive-behavior)
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

`Tabs` provides `size` and `variant`. Put those values on the root as data
attributes or CSS variables. `TabsList`, `TabsTrigger`, and `TabsContent` use
named group selectors or inherited variables to apply slot-specific classes.
Consumers do not repeat `size="lg"` on every slot, and a visual-only change does
not broadcast through React context.

## Prefer the CSS propagation ladder

For visual configuration, choose the first mechanism that fits:

1. Put direct root styles in the root's merged `className`.
2. Put `data-size`, `data-variant`, or another semantic attribute on the root
   and use a named group such as `group/card` with descendant
   `group-data-[size=sm]/card:*` selectors.
3. Define inherited CSS variables on the root when several slots share a token
   such as spacing, height, radius, or color. Let each slot consume the variable.
4. Pass a class or variant prop directly when the connected component is
   portaled or is not a DOM descendant.
5. Use React context only when JavaScript behavior—not only CSS—must read the
   value and the prior mechanisms cannot preserve the component contract.

This is the shadcn-style pattern: `className` remains the extension surface,
semantic data attributes describe state, named groups connect descendants, and
CSS variables distribute shared design tokens. It also matches class-composed
component libraries that merge defaults with consumer classes through `cn`.

## Preserve base styles and defaults

Before extending a primitive, record its:

- variant and size values;
- default variants;
- CSS variables and data attributes;
- state selectors such as `data-[state=active]`;
- class merge order;
- child icon and text selectors;
- responsive and orientation behavior.

The extension must support the base values unless intentionally documented
otherwise. When family props are omitted, preserve the base visual contract.

Do not copy today's generated class string into a wrapper and treat it as the
contract. Reuse or extend the base variant definition when it is exported. When
it is not exported, keep the wrapper narrow and test it against the base.

## Model a family variant matrix

Define supported semantic values first:

```ts
type FamilySize = "sm" | "default" | "lg"
type FamilyVariant = "default" | "line"
```

Then map each value per connected slot:

| Input | List | Trigger | Content |
| --- | --- | --- | --- |
| `size="sm"` | compact gap/radius | compact target/type/icon | compact inset |
| `size="default"` | base contract | base contract | base contract |
| `size="lg"` | larger container rhythm | larger target/type/icon | larger inset |
| `variant="line"` | line container treatment | active underline | line spacing |

Not every slot needs a class for every value. It must still receive the same
semantic input so future changes remain coherent.

Use one shared family input type. A slot may use its own CVA because a trigger
and a list express `lg` differently.

## Promote semantics, keep layout local

First identify the visual role. If the repository already has `Card`, `Alert`,
`Empty`, `Item`, `Field`, or another matching primitive, compose it rather than
recreating its border, background, radius, and padding on a raw element. A raw
`div` remains appropriate for layout-only grid, flex, width, alignment, or
spacing wrappers.

When several consumers need a different card color, border treatment, or
internal scale, add a typed primitive variant such as `variant="muted"` or a
supported `size`. Keep external margins and page placement in consumer
`className`; they are not component size semantics.

Create a typed variant when a style difference:

- repeats across consumers;
- affects multiple connected slots;
- represents a named design-system concept;
- must remain coherent after base-component updates;
- changes interaction target, typography, icon, spacing, or state styling as
  one supported mode.

Keep `className` at the consumer when a difference:

- controls page layout, grid placement, width, margin, or alignment;
- is unique to one composition;
- does not describe a reusable component mode.

`className="w-full md:w-auto"` is usually consumer layout.
`size="lg"` is family semantics.

## Avoid leaf sizing patches

Do not solve reusable sizing with:

```tsx
<TabsTrigger className="min-h-10 px-4 text-base" />
```

The patch bypasses the family API, may conflict with the list container, and
must be repeated for every trigger. Add `size="lg"` to the root and map `lg`
across the connected slots.

Similarly, avoid child selectors that accidentally resize unrelated nested
elements. Scope icon and text styling to the slot's documented structure.

## Root defaults and child overrides

Use the root value as the default for every connected slot. Add a child override
only when there is a real composition that needs it:

```tsx
<Toolbar size="lg">
  <ToolbarButton size="sm" aria-label="Dismiss" />
</Toolbar>
```

The override must be explicit, typed, and local. It is an escape hatch, not the
normal usage. Avoid separate uncontrolled style contexts per child.

## Extend the base or the family

Add a variant to the base design-system primitive when it is:

- domain-neutral;
- useful across unrelated features;
- compatible with the primitive's semantics;
- supportable as part of the design-system contract.

Keep a variant in the feature family when it represents product semantics,
depends on feature context, or would make the base API misleading.

For example, `size="lg"` may belong to the base `SelectTrigger`; a
`review-state="blocked"` appearance belongs to a reviewer workflow.

## Variant implementation pattern

Prefer root attributes and inherited tokens for connected DOM slots:

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

Use `data-slot` to identify parts for styling and tooling. Use a named group to
avoid accidental coupling to an unrelated ancestor group. Prefer one inherited
CSS variable when several slots share the same spacing token instead of
repeating parallel group selectors.

Keep the base/default branch unchanged when the base primitive already owns the
correct default. This reduces drift.

Merge classes in this order:

1. base primitive styles;
2. family slot styles;
3. explicit consumer `className`.

Use the repository's merge utility so Tailwind conflicts resolve predictably.

### Local overrides without context

Keep root values as the normal API. If a slot needs a supported local override,
put an optional data attribute or CSS variable on that slot. Apply inherited
root selectors only when the local attribute is absent. Avoid relying on CSS
source order to resolve a root/child conflict.

Do not use `cloneElement` to push styling props into arbitrary children. It is
brittle with fragments, portals, render props, and user components.

## Responsive behavior

Do not hide viewport policy inside generic slots merely to reuse code. Prefer an
adapter that composes the same domain items into a dropdown on wide screens and
a sheet on compact screens.

Responsive CSS inside a slot is appropriate when it is intrinsic to that slot's
layout, not when it chooses product capability or changes interaction semantics.

## Maintenance audit

When the base primitive changes:

1. compare its prop and variant types;
2. compare default styles and state selectors;
3. verify the family default still matches;
4. verify root values reach every connected slot;
5. test one child override;
6. visually exercise the full size and variant matrix.
