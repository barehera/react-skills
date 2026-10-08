---
name: extract-named-helpers
description: Extract focused named helpers from React and TypeScript derivations, duplicated predicates, and branching transforms. Use when simplifying components, hooks, callbacks, or domain utilities, or when auditing existing helpers for over-engineering; decide what stays inline, where helpers live, and how signatures communicate intent without changing behavior.
---

# Extract Named Helpers

Make call sites express intent while keeping small, obvious logic local.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no layer. A helper stays in the layer of the code it was
extracted from: a derivation over product data stays in the feature adapter,
a helper over slot props stays in the family, and a class helper stays with
the primitive. Extraction must never create an import that points upward.

## Required workflow

1. Inspect repository instructions, callers, neighboring domain utilities,
   types, compiler configuration, and checks; when auditing, also read the
   planning artifacts the repository supplies (roadmap, backlog, plan).
   Preserve the existing stack and business ownership.
2. Identify the decision or transform hidden in the implementation. Compare
   extraction against a named local value and simpler control flow first.
3. Choose the narrowest signature and placement using the contracts below.
4. Preserve evaluation order, nullability, mutation versus copy semantics,
   exception behavior, callback cancellation, and hook dependencies.
5. Check every changed caller and run relevant type and behavior checks. Report
   what was extracted, deliberately left inline, and validated.

## Extraction triggers

Extract when a useful domain name makes one of these easier to understand:

1. A multi-step array or object derivation hides the answer the caller needs.
2. The same predicate or transform is duplicated within or across modules.
3. A branching or substantial inline transform obscures the surrounding
   callback's responsibility.

Operation counts and roughly three lines are review signals, not automatic
thresholds. A one-use effect handler can retain several statements when their
ordering is clearest at the decision point.

`every` alone returns true for an empty array, so do not replace a nonempty
completion rule with a vacuously true result. Extract a
branching state updater as `update(previous => toRestartedDraft(previous))`,
keeping the callback that receives the current value instead of precomputing
from a stale render snapshot.

Delete narration the helper name replaces; route surviving product rules to
`$document-business-logic` at the owning declaration. Preserve required
technical comments and supported rationale.

## Do not extract

Keep a flat composition of named flags, one-line fallback, or simple single
map/filter inline when it has one caller and no hidden derivation or meaningful
branch. Prefer `const canSubmit = isValid && !isSaving && hasChanges` to a
wrapper that only repeats that name. Keep a single-use side-effect branch, or a
callback whose short ternary already communicates its purpose, inline unless
extraction creates a useful responsibility boundary.

Before wrapping duplicated side effects, consider one call at their common
decision point. Hoist only if order, conditions, exceptions, and call count stay
equivalent; do not hoist across `await`, cancellation checks, or early returns
without proving the same paths execute the side effect once. Similar-looking
code with different business policies is not necessarily duplication.

## Auditing existing helpers

The rules above decide whether to create a helper. An audit of an existing
helper asks whether its name carries meaning the call site would lose:

- keep a helper whose name carries a product rule, an external contract such
  as a wire format or boundary value, or a transform that a recorded upcoming
  feature needs;
- inline a helper only when it restates its body or is a plain alias of another
  function;
- narrow a helper with no meaning outside its module: drop `export` and keep
  it module-private;
- report anything else as `revisit`: name the helper and the missing evidence,
  and leave the code unchanged. Do not inline it on caller count alone.

Keep `toDayEndDateTime(day)`, whose name carries the API's inclusive day bound
that two scheduled features need. Inline `isReadyToSave(isValid, isSaving)`,
which only restates `isValid && !isSaving`, and a one-caller
`getItemCount(items)` that returns `items.length`. A one-line fallback such as
`parse(day) ?? undefined` stays when a recorded feature reuses it; without that
record it is `revisit`, not automatically inlined. These criteria decide
whether a helper stays named; whether it stays exported, and where it lives,
follows Placement.

## Placement

| Consumers | Default |
| --- | --- |
| One module, including several callers inside it | Module-private helper beside or above its consumers; two exports may share one private predicate |
| Multiple modules with one domain owner | Export from the existing cohesive domain utility module and import it directly |
| Never by default | Exports with no current or recorded consumer outside the module (speculative exports), a miscellaneous `helpers.ts`, a re-export barrel, or one file per tiny helper of the same concern |

A recorded consumer is one named in a roadmap, backlog, plan, or design, or an
existing sibling screen with the same shape; speculation has no record. A small
module for a separate purpose, such as locale resolution beside formatting, is
a legitimate boundary even with one function; route purpose placement to
`$feature-sliced-design`.

An independently testable policy, a server-only dependency, or an existing
public API may justify a dedicated module even with one caller. Cross-feature
reuse follows business ownership and dependency direction, not caller count
alone; do not move business rules into generic Shared utilities. Preserve
existing paths in a scoped extraction.

## Signature and naming

When reading several related fields from an object callers already hold,
accept that object using a minimal structural type, or `Pick` when an
authoritative type exists. Avoid `helper(object.field, object)`. A
single-value predicate usually takes that value; unrelated arguments, such as
a value and a threshold, stay separate. Preserve meaningful null/undefined
distinctions and generic inference, and do not add optionality only to avoid
fixing a caller with invalid data.

| Prefix | Expected contract |
| --- | --- |
| `is`, `has`, `can`, `should` | Pure boolean predicate (or type guard) |
| `get` | Value with explicit absence behavior |
| `create`, `build` | New value/object |
| `to`, `with` | Transformed copy |
| `reset`, `begin` | Domain transition; make copy versus mutation explicit in the type and established vocabulary |
| `handle` | Event response with side effects, not a pure factory |

Rename misleading verbs only in scope and update callers; preserve public API
compatibility unless changing it is part of the task.

## Hooks and helpers

Hooks own React subscriptions, effects, refs, and store/query access. Extracted
pure decisions live at module scope with inputs passed explicitly; hooks
compose them and return useful named values/actions. Do not turn a pure
calculation into a hook, wrap a simple selector in an extra hook, or extract
every hook-local expression. Closures that coordinate current hook state can
remain in the hook.

Module scope does not memoize results. Follow `$use-preferred-react-stack`
for compiler detection and the legacy memoization boundary; with the compiler
enabled, add no routine `useMemo`/`useCallback` wrappers around helpers, and
do not remove unrelated existing memoization.

## Companion skill routing

- `$feature-sliced-design`: layer ownership and cross-feature placement.
- `$build-composable-components`: public component anatomy and scoped state.
- `$build-forms`: form ownership, schemas, and field bindings.
- `$manage-server-state`: transport, query, mutation, and cache contracts.
- `$document-business-logic`: surviving non-obvious product rationale.
- `$use-preferred-react-stack`: library selection and compiler policy.

Recommend an absent companion once with its concrete benefit; require approval
to install it and continue without it when declined.

## References

- [Placement examples](references/placement.md): recorded consumers, existing
  lower-layer exports, and purpose splits.
- [examples/inspection.ts](examples/inspection.ts) and
  [examples/use-inspection-status.ts](examples/use-inspection-status.ts):
  type-checked helpers and the hook that composes them.
