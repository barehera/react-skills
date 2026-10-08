# Review and testing

## Contents

- [Audit order](#audit-order)
- [Judge over-engineering](#judge-over-engineering)
- [Audit findings](#audit-findings)
- [Extension scenarios](#extension-scenarios)

## Audit order

Check the family against every core contract in `SKILL.md` and the reference
that covers the touched area, in this order:

1. Trace root context or store creation; two mounted roots need isolated state
   and unique IDs.
2. Trace one structural slot and one domain item.
3. Trace overlays across content that unmounts.
4. Trace a mutation through cache effects, rollback, and success side effects.
5. Inspect every consumer for repeated props, classes, and product-policy
   switches.
6. Compare the family's styles with the base variant contract; omitted props
   still render like the base.
7. Check optional JSX against [Names and JSX](composition.md#names-and-jsx).

Report root causes and the smallest architectural correction, not only the
visible broken class.

## Judge over-engineering

Use this test when an audit or cleanup refactor asks whether an existing part,
slot, variant, root prop, domain adapter, or exported family member should
stay. Creating a family still follows the smallest-coherent-family rule: do not
add parts for speculation.

Before judging, read the planning artifacts the repository or user supplies:
roadmap, backlog, plan, design, or tickets. Never invent one. A low caller
count is a signal, never the verdict.

- **Extension point**: a slot or part that consumers compose; an exported hook
  or context accessor that lets consumers build their own parts; or a
  documented public member of a package that other apps compose. For a
  published package, the caller population is every consuming app, not the
  audited one. An unused variant value, or a root prop no consumer sets, is not
  an extension point by itself; rows 3-6 judge it.
- **Recorded consumer**: a consumer named in a roadmap, backlog, plan, design,
  or ticket; a sibling screen that already exists with the same shape; or
  another app that composes a published package.
- **Speculation**: "might be useful some day", with no record.
- **Revisit**: report the abstraction and the missing evidence, and leave the
  code unchanged.

Apply the rows in order. The first matching row decides.

| Row | Question | Verdict |
| --- | --- | --- |
| 1 | Duplicate or test-only: a copy of another part, a second suite for the same behavior, or an export or wrapper that exists only so a test can reach code? | remove |
| 2 | Extension point? | keep |
| 3 | Recorded consumer of this member: a record names a consumer that needs it (for a variant value, a consumer of the part it styles)? | keep, citing the record |
| 4 | Keeps features composable: it holds structure, behavior, or a binding that a new screen would otherwise copy or re-derive? | keep |
| 5 | Dead: it forwards props unchanged, only selects children the consumer could omit, or nothing reads it, not even inside its own module? | remove |
| 6 | Otherwise, such as an unused variant value or optional prop, other than a row 5 switch, that implements distinct behavior and has no record | revisit |

- Row 5's switch clause follows
  [Switches and modes](composition.md#switches-and-modes): a `mode` or
  `layout` root prop that no consumer sets and no record mentions is removed
  together with the private branches only it renders, even when a branch
  implements real behavior such as grouping. If a record later asks for that
  behavior, it returns as a part consumers compose, not as a mode. A record
  that names consumers of the family does not keep such a switch, because
  composition already serves that need; neither does row 4, which a style
  value or switch does not pass by itself.
- With no planning artifact, row 3 never matches and the other rows still
  apply.
- Remove only duplication, test-only indirection, and dead members. Narrow
  before deleting: when every reader of an export is inside its own module,
  drop `export` and keep the member.
- When the audit finds repeated UI, add a part to the existing family that the
  next screen can compose, not a closed wrapper around the family, and justify
  the addition with the same rows.

```tsx
// Audit input: ResourceTableSubRow has variant "attached" | "inset"; only
// "inset" is used today. The backlog lists two more tables with nested
// detail rows.
// Previous verdict: "0 callers for 'attached' -> drop the variant prop."
// Improved verdict: row 3 (recorded consumer) -> keep; cite the backlog item.
<ResourceTableSubRow variant="inset">{children}</ResourceTableSubRow>

// A recorded consumer keeps the open parts it composes instead of forking.
// One consumer today; a backlog item adds period filters to two more lists,
// and one of them needs presets between the bounds.
<PeriodPicker value={period} onValueChange={setPeriod}>
  <PeriodPickerFrom />
  <PeriodPickerPresets /> {/* inserted by the second consumer; no family edit */}
  <PeriodPickerSeparator />
  <PeriodPickerTo />
</PeriodPicker>
// Speculation, still rejected: "someone might want a third bound one day",
// with no backlog item -> do not add PeriodPickerThirdBound.
```

```ts
// Remove (row 1): exported only so a test can reach it; no component uses it.
export function __resourceTableRowsForTest() { /* ... */ }

// Narrow: every reader is in this module -> drop `export`, keep the function.
export function getResourceRowNoteId(rowId: string) { return `${rowId}-note` }

// Keep (row 2): consumers call it to build custom cells inside the family.
export function useResourceTable() { /* reads the family context */ }
```

## Audit findings

When the user requests review only:

- prioritize findings by user impact and architectural reach;
- cite precise files and lines;
- distinguish confirmed defects from maintainability risks; a defect that holds
  only under an assumption (for example, the same record appearing in two
  instances) is a risk, so state the assumption;
- include a concrete correction and the contract it restores;
- report each judged abstraction as `keep`, `remove`, or `revisit` with the
  row that decided it; for each proposed removal, name the removal row and
  confirm that no keep row applies.

## Extension scenarios

Forward-test the scenarios relevant to the task. Each one fails if it requires
editing a structural slot, duplicating base-item behavior, or adding props
across consumers.

- **Add a size or variant**: one type addition and slot mappings; active,
  disabled, focus-visible, and selected states still work. A base primitive
  takes only domain-neutral variants.
- **Recompose**: omit, reorder, and conditionally render actions and insert a
  consumer separator, leaving no broken separators or empty groups. Reorder the
  collection; position-aware leaves still derive their index.
- **Customize items**: change an item's anatomy through `children` or the
  render callback without moving the array or reading it twice.
- **Mount two instances**: open, mutate, and close each independently.
- **Unmount the launcher**: close the menu or hide the conditional part that
  opened an overlay; the overlay stays open.
- **Fail the async path**: caches, optimistic state, selection, focus, overlay
  state, and notifications recover together.
