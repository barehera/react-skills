# Styling and size

Layer: composable family.

The root owns `size` and `variant`. Write them as data attributes on the
element that wraps the parts, and mark that element as a named group:

```tsx
<div data-slot="toolbar" data-size={size} className="group/toolbar" />
```

Parts read the value with named group selectors, so a nested family of the
same kind does not inherit the outer size:

```tsx
className={cn(
  "h-8 px-2 text-sm",
  "group-data-[size=lg]/toolbar:h-10 group-data-[size=lg]/toolbar:text-base",
  className
)}
```

When a Radix part renders in a portal (menu or popover content), put the data
attribute and the group on the content element, because the portal leaves the
root's DOM subtree.

Omitting `size` must render exactly the primitive's base classes.
