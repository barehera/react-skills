# Worked feedback loop

This abbreviated example shows how a project-specific correction becomes a
general rule without copying the entire implementation.

## Project observation

An extended card footer used one long class string containing base layout plus
`primary` and `destructive` named-group selectors. The user accepted the styles
but found the mixed concerns difficult to review and maintain.

```tsx
className={cn(
  "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
  "group-data-[variant=primary]/card:border-primary-foreground/20 group-data-[variant=primary]/card:bg-primary-foreground/10",
  "group-data-[variant=destructive]/card:border-destructive/20 group-data-[variant=destructive]/card:bg-destructive/10",
  className
)}
```

## Captured finding

- Category: `missing-rule`
- Severity: `medium`
- Recurrence: `repeated`
- Confidence: `high`
- Current behavior: unrelated base and variant selectors were placed in one
  difficult-to-scan string.
- Preferred behavior: keep short lists intact, but group long lists by concern
  in ordered `cn(...)` arguments and preserve consumer overrides last.
- Generalization test: applies to Tailwind lists mixing multiple states or
  semantic variants; does not require one string per utility.
- Acceptance criteria: an agent can identify base, state, variant, and consumer
  override groups without changing merge order or generated classes.

## Integration decision

Place the concise contract in the component skill's non-negotiable rules, put
the detailed grouping criteria in its styling reference, update a worked
example, and add a review-checklist item. Do not create a formatter rule that
blindly splits every class because the decision is semantic, not line-length
only.

This is the desired conversion: preserve the user's real pain point, extract
the ownership principle, define its boundary, and make the result testable.
