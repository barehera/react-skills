# Review and testing

Use this reference to audit an existing family or verify a new one.

## Contents

- [Review order](#review-order)
- [Contract checklist](#contract-checklist)
- [Extension scenarios](#extension-scenarios)
- [Verification depth](#verification-depth)
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
- React Compiler projects contain no routine manual memoization hooks unless an
  exception documents a semantic identity requirement.
- Consumer layout classes remain possible.
- Long Tailwind class lists are grouped by concern in ordered `cn(...)`
  arguments; base styles remain first, conflict precedence is intentional, and
  the consumer `className` remains last.
- Shared domain inputs are supplied once.
- Each domain item has one focused responsibility.
- Independently optional fields, actions, statuses, separators, and layout
  regions are exposed as composable slots or items rather than hidden in a
  convenience component.
- Collection item identity is supplied once; nested leaves do not require
  repeated IDs or positional indexes.
- Collections received by a root are passed once; a `Collection`, `Items`,
  `Rows`, or `Results` boundary owns enumeration and cohesive state gating while
  a render callback keeps every item's anatomy consumer-defined.
- Consumer `.map()` is used only for independent roots whose family root does
  not receive that collection.
- A consumer can omit, reorder, replace, or augment an item's visible regions
  without reimplementing its selection, mutation, keyboard, or disabled logic.
- Logic-bearing items forward compatible primitive props and accept custom
  children instead of locking consumers to one icon-and-label presentation.
- A cohesive compound family is discoverable from one shadcn-style component
  module; it is not fragmented into separate root, context, item, and overlay
  files without independent ownership or dependency reasons.
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

For a picker or result list, replace the default item description with custom
content, omit its indicator, and insert a consumer-owned badge. The test fails
if doing so requires editing a family-owned presentation or duplicating the
base item's behavior. Also verify that a root-owned result array is not passed
to the root and then referenced again by the consumer solely for enumeration.

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

## Audit findings

When the user requests review only:

- do not edit files;
- prioritize findings by user impact and architectural reach;
- cite precise files and lines;
- distinguish confirmed defects from maintainability risks;
- include a concrete correction and the contract it restores.
