# Worked feedback loop

## From observation to rule

An extended card footer used one long class string containing base layout plus
`primary` and `destructive` named-group selectors. The user accepted the styles
but found the mixed concerns difficult to review.

```tsx
className={cn(
  "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
  "group-data-[variant=primary]/card:border-primary-foreground/20 group-data-[variant=primary]/card:bg-primary-foreground/10",
  "group-data-[variant=destructive]/card:border-destructive/20 group-data-[variant=destructive]/card:bg-destructive/10",
  className
)}
```

[The captured report](../examples/composable-component-feedback.md) keeps that
pain point as a principle with a boundary: group a long list by concern in
ordered `cn(...)` arguments, consumer override last; short lists stay intact.

Integration: a concise core rule in the component skill, the grouping criteria
in its styling reference, an updated worked example, and a review-checklist
item. No formatter rule that splits every class, because the decision is
semantic, not line-length only.

## Convert feature names before capture

This is feature-bound and belongs only under `Evidence`:

```text
Proposed skill change: Update InvoicePanelTitle in invoice-panel.tsx.
Acceptance criteria: InvoicePanelTitle still sets id after the prop spread.
```

The same finding in vocabulary a skill could publish:

```text
Proposed skill change: Add a previous-versus-improved snippet beside the
authoritative-bindings rule in SKILL.md.
Acceptance criteria: The skill example applies id={titleId} after {...props}.
```

```tsx
// Previous
<Text id={titleId} {...props} />

// Improved
<Text {...props} id={titleId} />
```

The local export and path remain reproduction evidence under `Evidence`.
