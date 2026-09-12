# Extraction triggers and boundaries

Previous call site:

```ts
const checklist = sections.filter(isChecklist).map(parseChecklist).find(Boolean)
const canPublish = isOwner && !!checklist && checklist.steps.every(isComplete)
```

Prefer `const canPublish = isOwner && hasCompletedChecklist(sections)` when
the predicate names a real policy. Preserve empty-list behavior: `every` alone
returns true for an empty array. Do not silently replace a nonempty completion
rule with a vacuously true result. The complete inspection example handles this.

A branching updater can become `update(previous => toRestartedDraft(previous))`.
Keep the callback that receives the current value; do not precompute from a
stale render snapshot. Do not extract a callback merely because it contains a
short ternary when the current form already communicates its purpose.

Keep these inline:

```ts
const canSubmit = isValid && !isSaving && hasChanges
const targetId = remoteId ?? localId
const visibleItems = items.filter(item => item.visible)
```

Hoisting can remove duplication without a helper:

```ts
clearPending()
if (isQuotaError(error)) {
  removeDraft()
  return
}
showError()
```

This replaces a `clearPending()` at the start of both branches only if evaluating
the predicate before or after the reset is equivalent. If the predicate reads
pending state, can throw, or the reset originally ran after another effect,
retain the original ordering. Do not hoist across `await`, cancellation checks,
or early returns without proving the same paths execute the side effect once.
