# Signatures and naming

Avoid asking callers to pass both a field and its parent:

```ts
// Previous
hasBlockingSection(record.sections, record)

// Improved signature
type SectionSource = {
  sections?: readonly { complete: boolean }[] | null
  completedAt?: number | null
}

function hasBlockingSection(record: SectionSource | null | undefined): boolean {
  return record?.completedAt == null &&
    (record?.sections?.some(section => !section.complete) ?? false)
}
```

Read only the declared shape. Prefer `Pick<ExistingType, ...>` when an
authoritative type exists rather than maintaining a duplicate model. Do not
add optionality solely to avoid fixing a caller with invalid data.

A function reading only a status accepts the status; unrelated arguments such
as a value and a comparison threshold can remain separate. The goal is to
avoid redundant decomposition, not to force every function into an object bag.

Use `createQuotaMessage` for a pure factory and `handleQuotaError` for an event
response that shows a toast. `getChecklist` must make absence explicit, while
`hasCompletedChecklist` returns a boolean. Prefer `toRestartedDraft` or
`withClearedResults` for immutable transforms when `reset` suggests a mutating
store action in that repository. Do not rename unrelated APIs on sight.
