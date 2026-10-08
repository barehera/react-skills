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

## Auditing existing helpers

The rules above decide whether to create a helper. An audit of a helper that
already exists asks whether its name carries meaning the call site would lose:

- keep a helper whose name carries a product rule (often with a Business Logic
  block), an external contract such as a wire format or boundary value, or a
  transform that a recorded upcoming feature needs;
- inline a helper only when it restates its body or is a plain alias of another
  function;
- narrow a helper with no meaning outside its module: drop `export` and keep
  it module-private;
- report anything else as `revisit`: name the helper and the missing evidence,
  and leave the code unchanged. Do not inline it on caller count alone.

A recorded feature is one named in a roadmap, backlog, plan, or design, or an
existing sibling screen with the same shape. These criteria decide whether a
helper stays named; whether it stays exported, and where it lives, follows
[placement](placement.md).

```ts
// Keep: the name carries an external contract (the API's inclusive day bound).
// Two scheduled features filter by period and need the same bounds.
export function toDayEndDateTime(day: string): string {
  return `${day}T23:59:59.999`
}

// Inline: the name restates the body and carries no rule.
function isReadyToSave(isValid: boolean, isSaving: boolean) {
  return isValid && !isSaving
}
// -> const canSave = isValid && !isSaving
```

Counterexample: an existing one-caller `getItemCount(items)` that returns
`items.length` has no rule and no contract, so it is inlined. A one-line
fallback such as `parse(day) ?? undefined` stays when a recorded feature reuses
it; without that record it is `revisit`, not automatically inlined.
