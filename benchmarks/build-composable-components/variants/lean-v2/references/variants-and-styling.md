# Variants and styling

Use this reference whenever a component family extends styled primitives.

## Contents

- [Propagate root values through the DOM](#propagate-root-values-through-the-dom)
- [Structure long class lists](#structure-long-class-lists)
- [Extend the base or the family](#extend-the-base-or-the-family)
- [Variant implementation pattern](#variant-implementation-pattern)

## Propagate root values through the DOM

The family root owns semantic `size` and `variant`, and each slot maps the value
to its own styles. Use the DOM, not React context, so a visual-only change does
not re-render every slot. Choose the first mechanism that fits:

1. `data-size` or `data-variant` on the root, read through a named group:
   `group/card` on the root and `group-data-[size=sm]/card:*` on slots.
2. Inherited CSS variables on the root when several slots share a token such as
   height, spacing, or radius; a nested family root resets the variable, which
   group selectors do not.
3. React context only for a part that is not a DOM descendant, such as a
   portaled `SelectContent`, or a value JavaScript must read.

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

- Base layout and default appearance come first; consumer `className` comes
  last.
- Keep conflict-sensitive groups in their intended order, because later
  conflicting classes win.

## Extend the base or the family

Add a variant to the base primitive when it is domain-neutral and compatible
with the primitive's semantics. Keep it in the feature family when it
represents product semantics. `size="lg"` may belong on the base
`SelectTrigger`; a `review-state="blocked"` appearance belongs to a reviewer
workflow.

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

- Leave the default branch unchanged when the base primitive already owns it.
- Merge base styles, then family slot styles, then consumer `className`.

For a supported local override, put an optional data attribute or CSS variable
on that slot and apply inherited root selectors only when it is absent; do not
rely on CSS source order to resolve the conflict.
