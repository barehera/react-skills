# Review and testing

Use this reference to audit an existing family or verify a new one.

## Contents

- [Review order](#review-order)
- [Contract checklist](#contract-checklist)
- [Extension scenarios](#extension-scenarios)
- [Judge over-engineering](#judge-over-engineering)
- [Audit findings](#audit-findings)

## Review order

1. Read the base primitives and exported prop types.
2. Trace root context or store creation.
3. Trace one structural slot and one domain item.
4. Trace overlays across transient-content unmounting.
5. Trace a mutation through cache effects, rollback, and success side effects.
6. Inspect every consumer for repeated props, classes, and product-policy
   switches.
7. Compare the family's supported styles with the base variant contract.

Report root causes and the smallest architectural correction, not only the
visible broken class.

## Contract checklist

Check the family against every core contract in `SKILL.md` and the rules in
the reference that covers the touched area. These points surface mainly in
review:

- The default branch still matches the base primitive, and child overrides do
  not become required repetition.
- Consumer layout classes remain possible.
- Long class lists follow
  [Structure long class lists](variants-and-styling.md#structure-long-class-lists).
- Optional JSX follows
  [JSX conventions](architecture-and-api.md#jsx-and-element-conventions).
- Two mounted roots have isolated state and unique IDs.
- Navigation and analytics run only at the intended lifecycle point.

## Extension scenarios

Forward-test the scenarios relevant to the task. Each one fails if it requires
editing a structural slot, duplicating base-item behavior, or adding props
across consumers.

- **Add a domain item.** A hypothetical `ArchiveItem` reuses shared resource
  data, base styles, and placement without touching other items.
- **Add a size or variant.** `size="xl"` needs one type addition and slot
  mappings. Confirm a new variant is domain-neutral before placing it in a base
  primitive, and check active, disabled, focus-visible, destructive, and
  selected states across the matrix.
- **Recompose capabilities.** Omit and reorder actions, insert a consumer
  separator or layout wrapper, conditionally render one action, and move one
  into another exposed region, with no broken separators or empty groups left
  behind. Reorder the collection and confirm position-aware leaves derive their
  index.
- **Customize parts.** Change a heading through the title's `children`,
  disable Confirm while Cancel stays enabled, and render a title
  polymorphically when the primitive supports it, without a root `title`,
  callback bags, or forced inner elements.
- **Customize collection items.** For a presentational list, map at the call
  site and add a badge without moving the array to the root. For a family that
  owns result gating, replace an item's description, omit its indicator, and
  add a badge through the render callback; confirm the consumer does not also
  read the root-owned array to enumerate.
- **Mount repeated instances.** Open, mutate, and close two roots
  independently, and reorder or remove their resources while one overlay is
  open.
- **Fail the async path.** Force the backend to fail and confirm caches, local
  optimistic state, selection, focus, overlay state, and notifications recover
  together.
- **Change the interaction surface.** Compose the same capability into a
  dropdown and a sheet, keeping each surface's base semantics.

## Judge over-engineering

Use this test when an audit or cleanup refactor asks whether an existing part,
slot, variant, root prop, domain adapter, or exported family member should
stay. Creating a family still follows the smallest-coherent-family rule: do not
add parts for speculation.

Before judging, read the planning artifacts the repository or user supplies:
roadmap, backlog, plan, design, or tickets. Never invent one. Count callers
only as a signal; a low caller count is never the verdict.

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

```tsx
// Audit input: ResourceTableSubRow has variant "attached" | "inset"; only
// "inset" is used today. The backlog lists two more tables with nested
// detail rows.
// Previous verdict: "0 callers for 'attached' -> drop the variant prop."
// Improved verdict: row 3 (recorded consumer) -> keep; cite the backlog item.
<ResourceTableSubRow variant="inset">{children}</ResourceTableSubRow>
```

A recorded consumer keeps the open parts that let it compose instead of fork:

```tsx
// One consumer today. A backlog item adds period filters to two more lists,
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

Remove only duplication, test-only indirection, and dead members. Narrow
before deleting: when every reader of an export is inside its own module, drop
`export` and keep the member.

```ts
// Remove (row 1): exported only so a test can reach it; no component uses it.
export function __resourceTableRowsForTest() { /* ... */ }

// Narrow: every reader is in this module -> drop `export`, keep the function.
export function getResourceRowNoteId(rowId: string) { return `${rowId}-note` }

// Keep (row 2): consumers call it to build custom cells inside the family.
export function useResourceTable() { /* reads the family context */ }
```

- Row 5's switch clause follows "Prefer composition to switches" in
  [architecture-and-api.md](architecture-and-api.md#prefer-composition-to-switches):
  a `mode` or `layout` root prop that no consumer sets and no record mentions
  is removed together with the private branches only it renders, even when a
  branch implements real behavior such as grouping. If a record later asks for
  that behavior, it returns as a part consumers compose, not as a mode. A
  record that names consumers of the family does not keep such a switch,
  because composition already serves that need; neither does row 4, which a
  style value or switch does not pass by itself.
- With no planning artifact, row 3 never matches and the other rows still
  apply.
- When the audit finds repeated UI, add a part to the existing family that the
  next screen can compose, not a closed wrapper around the family. Justify the
  addition with the same rows, not with a caller threshold.

## Audit findings

When the user requests review only:

- prioritize findings by user impact and architectural reach;
- cite precise files and lines;
- distinguish confirmed defects from maintainability risks; a defect that holds
  only under an assumption (for example, the same record appearing in two
  instances) is a risk, so state the assumption;
- include a concrete correction and the contract it restores;
- report each judged abstraction as `keep`, `remove`, or `revisit` with the
  row of [Judge over-engineering](#judge-over-engineering) that decided it; for
  each proposed removal, name the removal row and confirm that no keep row
  applies.
