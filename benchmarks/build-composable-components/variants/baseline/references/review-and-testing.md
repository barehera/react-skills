# Review and testing

Use this reference to audit an existing family or verify a new one.

## Contents

- [Review order](#review-order)
- [Contract checklist](#contract-checklist)
- [Extension scenarios](#extension-scenarios)
- [Verification depth](#verification-depth)
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

- Base props, refs, events, defaults, accessibility, and keyboard behavior are
  preserved.
- Root semantic inputs reach every connected slot.
- The default branch still matches the base primitive.
- Child overrides are explicit and do not become required repetition.
- Every public part receives its own compatible primitive props directly; the
  root does not proxy leaf customization through `*Props` bags.
- Any compact convenience component is implemented from the open slots and does
  not become the only customization path.
- Semantic cards, alerts, empty states, fields, and items reuse repository
  primitives instead of duplicating their visual contracts on raw elements.
- New code in React Compiler projects adds no routine manual memoization;
  unrelated legacy calls remain untouched. Exceptions need a measured need or
  a documented semantic identity requirement.
- Consumer layout classes remain possible.
- Long Tailwind class lists are grouped by concern in ordered `cn(...)`
  arguments; base styles remain first, conflict precedence is intentional, and
  the consumer `className` remains last.
- The root contains only genuinely shared state, configuration, domain objects,
  and wiring; displayed copy and independently variable action props stay on
  their owning parts.
- Text parts receive displayed copy as `children`; context may transport their
  generated IDs but not copy solely to enable empty slots.
- Each independently optional action owns its `disabled`, loading, and event
  props unless the family documents a true shared lock.
- Each domain item has one focused responsibility.
- Each public part maps to one primitive or DOM role; polymorphism remains
  consumer-opt-in rather than forcing an inner element.
- Independently optional fields, actions, statuses, separators, and layout
  regions are exposed as composable slots or items rather than hidden in a
  convenience component.
- Collection item identity is supplied once; nested leaves do not require
  repeated IDs or positional indexes.
- Presentational arrays already owned by the call site use consumer `.map()` by
  default and keep the family list part structural.
- Collections move to the root only for controlled snapshots, virtualization,
  sorting, or cohesive loading/error/empty gating. Those collections are passed
  once and enumerated through a consumer-anatomy render callback.
- A consumer can omit, reorder, replace, or augment an item's visible regions
  without reimplementing its selection, mutation, keyboard, or disabled logic.
- Logic-bearing items forward compatible primitive props and accept custom
  children instead of locking consumers to one icon-and-label presentation.
- A cohesive compound family is discoverable from one shadcn-style component
  module; it is not fragmented into separate root, context, item, and overlay
  files without independent ownership or dependency reasons.
- A consumer hook or context accessor that is exported so consumers can build
  their own parts is an extension point, not a dead export.
- Two mounted roots have isolated state and unique IDs.
- Persistent overlays survive transient-content closure.
- Overlays for optional capabilities are explicitly composed as persistent
  siblings rather than silently mounted by the root.
- Product capability and responsive policy live in adapters or composition.
- Boolean-only optional JSX uses `&&`; ternaries represent two meaningful UI
  branches rather than an element-versus-`null` branch.
- All cache representations update and roll back together.
- Navigation and analytics run only at the intended lifecycle point.

## Extension scenarios

Forward-test at least the scenarios relevant to the task:

### Add a domain item

Add a hypothetical `ArchiveItem`. It should reuse shared resource data, base
styles, and placement without editing unrelated items or adding prop chains.

### Add a size

Add `size="xl"` mentally or in a focused test. It should require one semantic
type addition and slot mappings, not edits across consumers.

### Add a variant

Confirm that the new variant is domain-neutral before placing it in a base
primitive. Verify active, disabled, focus-visible, destructive, and selected
states across the matrix.

### Recompose capabilities

Omit and reorder actions. The root should not require boolean switches or leave
behind broken separators and empty groups.

Also insert a consumer-owned separator or layout wrapper, conditionally render
one action, and move an action into another exposed region. These changes should
not require editing a structural slot. Reorder the underlying collection and
verify position-aware leaves derive their current index rather than receiving a
stale index prop.

Change a heading through the title part's `children`, disable Confirm while
leaving Cancel enabled, and render a title polymorphically when the underlying
primitive supports it. These changes should not add root `title`, per-action
callback bags, or forced inner elements.

For a presentational list, map at the call site and add a consumer-owned badge
without moving the array to the root. For a picker or result family that truly
owns result gating, replace the item description with custom content, omit its
indicator, and insert a badge through the render callback. The test fails if
doing so requires editing family-owned presentation or duplicating base-item
behavior. Also verify that a root-owned result array is not passed to the root
and then referenced again by the consumer solely for enumeration.

### Mount repeated instances

Open, mutate, and close two roots independently. Reorder or remove their
resources while one overlay is open.

### Exercise async failure

Force the backend operation to fail. Verify remote caches, local optimistic
state, selection, focus, overlay state, and notifications recover coherently.

### Change interaction surface

Compose the same domain capability into a dropdown and a sheet. Preserve the
correct base semantics for each surface instead of forcing one DOM contract
onto both.

## Verification depth

Run checks in proportion to risk:

- typecheck for public API and selector safety;
- lint and format for repository consistency;
- unit tests for state transitions and variant mapping;
- interaction tests for focus, keyboard, dismissal, controlled behavior, and
  overlay lifecycles;
- mutation tests for optimistic updates and rollback;
- visual tests or browser review for the size/variant/state matrix;
- production build for framework boundaries and client/server separation.

Do not add a new test framework only to validate one component unless requested.
Use the repository's existing tools and explain any unverified behavior.

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
- **Revisit**: report the abstraction and the missing evidence; do not remove
  it on caller count alone.

Apply the rows in order. The first matching row decides.

| Row | Question | Verdict |
| --- | --- | --- |
| 1 | Duplicate or test-only: a copy of another part, a second suite for the same behavior, or an export or wrapper that exists only so a test can reach code? | remove |
| 2 | Extension point? | keep |
| 3 | Recorded consumer of this member: a record names a consumer that needs it (for a variant value, a consumer of the part it styles)? | keep, citing the record |
| 4 | Keeps features composable: it holds structure, behavior, or a binding that a new screen would otherwise copy or re-derive? | keep |
| 5 | Dead: it forwards props unchanged, only selects children the consumer could omit, or nothing reads it, not even inside its own module? | remove |
| 6 | Otherwise, such as an unused variant value or optional prop that implements distinct behavior and has no record | revisit |

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
  a `mode` root prop that no consumer sets, no record mentions, and that only
  selects omittable children is removed. A record that names consumers of the
  family does not keep such a switch, because composition already serves that
  need; neither does row 4, which a style value or switch does not pass by
  itself.
- With no planning artifact, row 3 never matches and the other rows still
  apply. A low caller count alone never sends a member to row 5.
- When the audit finds repeated UI, add a part to the existing family that the
  next screen can compose, not a closed wrapper around the family. Justify the
  addition with the same rows, not with a caller threshold.

## Audit findings

When the user requests review only:

- do not edit files;
- prioritize findings by user impact and architectural reach;
- cite precise files and lines;
- distinguish confirmed defects from maintainability risks;
- include a concrete correction and the contract it restores;
- report each judged abstraction as `keep`, `remove`, or `revisit` with the
  row of [Judge over-engineering](#judge-over-engineering) that decided it; for
  each proposed removal, name the removal row and confirm that no keep row
  applies.
