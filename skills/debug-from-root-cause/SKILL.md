---
name: debug-from-root-cause
description: Find the mechanism behind a bug before changing code, fix it in the layer that owns the defect, and lock it with a regression test. Use when something fails, crashes, renders wrong, or behaves unexpectedly and the cause is not yet known; when a test, type check, or build fails for an unclear reason; when an earlier fix did not hold; or when the user asks to investigate a problem without fixing it.
---

# Debug from Root Cause

Reproduce the failure, name the one mechanism that explains it, fix it where
it lives, and prove the fix with a test that failed before.

## Version

Read `../VERSION` and include `Thinstack v<version>` in the final handoff.

## Layer placement

Thinstack code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no layer; it finds which layer owns a defect. A wrong product
rule is fixed in the feature adapter, a broken slot or scoped store in the
composable family, and a focus or ARIA fault in the primitive extension. A fix
lands where the defect is, not where the symptom shows, and never makes a
family read a query or a primitive learn a product rule.

## Required workflow

1. **Reproduce.** Get the failure with exact steps or a command and its
   output. If it does not reproduce, say so and collect what would make it
   reproduce (versions, data, logs) rather than guessing a fix.
2. **Write the symptom down verbatim,** apart from any idea about its cause.
3. **Trace.** Follow inputs, state changes, and ownership from the entry point
   to the failure, reading the code on that path. Compare with a case that
   works: a sibling component, an earlier commit (`git log -p`, `git bisect`),
   or the same call with different data.
4. **Rank one to three hypotheses** by the evidence for each and by how
   cheaply each can be disproved. Test the cheapest one first, changing one
   thing at a time.
5. **Name the mechanism:** one sentence that explains every observation. Edit
   no product code before you can write it.
6. **Fix** in the layer that owns the defect, with the smallest change that
   removes the mechanism.
7. **Lock it** with a regression test that fails without the fix and passes
   with it, then prove the result through `$verify-and-report`.

When the user asked only to investigate, stop after step 5 and report the
mechanism and its proof.

After three fixes that did not hold, stop fixing. The assumption behind them
is wrong: report what each attempt showed and question the design with the
user.

## Report

```text
Symptom: <verbatim failure>
Cause: <the mechanism in one sentence>
Proof: <the observation that confirms it>
Fix: <file and layer>
Regression test: <test name>, fails before and passes after
Skipped: <left out on purpose>
Not checked: <could not verify>
```

## Smallest complete change

Change only what removes the mechanism. Take the first option that fully
works:

1. No code change when the cause is environment, configuration, or data; report
   it with the steps that fix it.
2. Correct the line that causes it, in the owning layer.
3. Restore a broken contract (a type, a schema, a prop) at its owner, so every
   consumer follows.
4. Write the minimum new code in the owning layer.

- Never hide a failure instead of removing it: no swallowed errors, retries
  that mask a fault, skipped or loosened tests, or `as` and `any` casts over a
  type error.
- Never cut Zod parsing at trust boundaries, error handling that prevents data
  loss, authentication and security checks, accessibility contracts, or
  anything the user asked for.
- Mark a deliberate limit with `// shortcut: <limit>, <when to upgrade>`.
- End the handoff with one `Skipped:` line for what was left out on purpose
  and one `Not checked:` line for what could not be verified.

## Companion skill routing

- The regression test for a product rule belongs to `$write-feature-tests`
  (a case-table row); a family or primitive fix gets a focused test next to
  it.
- Proving the fix and writing the final report belong to
  `$verify-and-report`.
- A defect that is really a misplaced responsibility goes to the owning skill:
  `$build-composable-components` for families and primitive extensions,
  `$build-forms` for fields and typed forms, `$manage-server-state` for
  transport, queries, and cache effects, and `$derived-types` for type drift.
- A gotcha that cost real time and will recur becomes a memory through
  `$keep-project-memory`.
- If a useful companion is not installed, explain its concrete benefit once
  and ask before installing it. Continue without it if the user declines.
