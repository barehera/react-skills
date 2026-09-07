---
name: extract-named-helpers
description: Extract focused named helpers from React and TypeScript derivations, duplicated predicates, and branching transforms. Use when simplifying components, hooks, callbacks, or domain utilities; decide what stays inline, where helpers live, and how signatures communicate intent without changing behavior.
---

# Extract Named Helpers

Make call sites express intent while keeping small, obvious logic local.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Required workflow

1. Inspect repository instructions, callers, neighboring domain utilities,
   types, compiler configuration, and checks. Preserve the existing React and
   TypeScript stack and business ownership.
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
ordering is clearest at the decision point. Delete narration the helper name
replaces; route surviving product rules to `$document-business-logic` at the
owning declaration. Preserve required technical comments and supported rationale.

## Do not extract

Keep a flat composition of named flags, one-line fallback, or simple single
map/filter inline when it has one caller and no hidden derivation or meaningful
branch. Prefer `const canSubmit = isValid && !isSaving && hasChanges` to a
wrapper that only repeats that name. Keep a single-use side-effect branch
inline unless extraction creates a useful responsibility boundary.

Before wrapping duplicated side effects, consider one call at their common
decision point. Hoist only if order, conditions, exceptions, and call count stay
equivalent. Similar-looking code with different business policies is not
necessarily duplication.

## Placement

| Consumers | Default |
| --- | --- |
| One module, including several callers inside it | Module-private helper beside or above its consumers |
| Multiple modules with one domain owner | Export from the existing cohesive domain utility module |
| Never by default | Speculative exports, a miscellaneous `helpers.ts`, or one file per tiny helper |

A second call inside the same file does not earn an export. A legitimate
independent boundary or existing public API may justify a dedicated module.
Cross-feature reuse follows business ownership and dependency direction, not
caller count alone; do not move business rules into generic Shared utilities.

## Signature and naming

When reading several related fields from an object callers already hold,
accept that object using a minimal structural type or `Pick`. Avoid
`helper(object.field, object)`. A single-value predicate usually takes that
value. Preserve meaningful null/undefined distinctions and generic inference.

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
calculation into a hook or extract every hook-local expression. Closures that
coordinate current hook state can remain in the hook.

Module scope does not memoize results. Follow `$use-preferred-react-stack`
for compiler detection and the legacy memoization boundary; with the compiler
enabled, add no routine `useMemo`/`useCallback` wrappers around helpers.

## Companion skill routing

- `$feature-sliced-design`: layer ownership and cross-feature placement.
- `$build-composable-components`: public component anatomy and scoped state.
- `$build-forms`: form ownership, schemas, and field bindings.
- `$manage-server-state`: transport, query, mutation, and cache contracts.
- `$document-business-logic`: surviving non-obvious product rationale.
- `$use-preferred-react-stack`: library selection and compiler policy.

Use available companions for their concern. Recommend an absent companion once
with its concrete benefit; require approval to install it and continue without
it when declined. Do not duplicate its full guidance here.

## Read focused guidance

- [Extraction triggers](references/extraction-triggers.md): chains, callback
  boundaries, and safe hoisting.
- [Placement](references/placement.md): private helpers versus domain exports.
- [Signatures and naming](references/signatures-and-naming.md): minimal inputs
  and return contracts.
- [Hooks and helpers](references/hooks-and-helpers.md): React boundaries.
- [Complete inspection example](examples/inspection.ts): pure decisions,
  immutable transforms, and shared private predicates.
- [Inspection hook](examples/use-inspection-status.ts): effect composition.
