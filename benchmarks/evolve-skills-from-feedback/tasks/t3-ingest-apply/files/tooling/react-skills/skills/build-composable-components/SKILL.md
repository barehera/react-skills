---
name: build-composable-components
description: Build reusable compound component families on shadcn/Radix primitives and compose them from feature adapters. Use when creating, extending, or reviewing a reusable component family such as menus, pickers, toolbars, or lists.
---

# Build Composable Components

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

- **Primitive**: shadcn/Radix files in `src/components/ui` and `cn`.
- **Composable family**: a compound root and its parts in
  `src/components/ui/<role>.tsx`. A family never imports feature modules,
  queries, mutations, or product policy.
- **Feature adapter**: `src/features/<feature>/components/` composes a family
  and owns data, mutations, permissions, and copy.

Dependencies point downward only.

## Companion skill routing

- `$manage-server-state` for queries, mutations, and cache effects.
- `$build-forms` for field families and typed forms.
- `$document-business-logic` for comments that explain product policy.

## Rules

1. **Composable family.** Choose capabilities by rendering or omitting parts
   (`{canDelete && <ActionMenuDeleteItem />}`), not with boolean switch props
   such as `showDelete` on the root, because each switch multiplies the states
   the family must handle.
2. **Composable family.** Every part accepts the props of the primitive it
   renders, spreads them, and merges the consumer `className` last with `cn`.
   Apply required bindings (generated ids, controlled `open`) after the spread.
3. **Composable family.** Set size and visual variant once on the root as a
   typed `size` or `variant` prop, expose it as `data-size` or `data-variant`,
   and style parts with named group selectors
   (`group/action-menu`, `group-data-[size=lg]/action-menu:h-10`). Do not
   patch individual parts with size classes at the call site.
4. **Composable family.** Propagate styling through the DOM (data attributes,
   group selectors, CSS variables). Use React context only for behavior that
   JavaScript must read, not only CSS.
5. **Composable family.** Keep state per root instance; never keep instance
   state in a module-level store.
6. **Feature adapter.** Labels and copy are children of the part that renders
   them, never root props.

Sizing details: [references/styling-and-size.md](references/styling-and-size.md).

## Example

[examples/action-menu.tsx](examples/action-menu.tsx) shows a family and a
feature adapter that composes it.

## Review checklist

- The family imports nothing from `src/features`.
- Capabilities are composed, not switched.
- Size and variant are set once on the root.
- Consumer `className` is merged last.
