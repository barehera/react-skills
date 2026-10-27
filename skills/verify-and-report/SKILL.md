---
name: verify-and-report
description: Prove every claim before making it and report the result in a compact fixed shape. Use before saying work is done, fixed, passing, or ready; when turning a request into acceptance checks; when a reversible choice would otherwise stall the task; when receiving review comments to act on; when writing review findings; or when a subagent reports success that needs checking.
---

# Verify and Report

Turn the request into checks, run the proof for each claim, decide small
choices without stalling, and report in a shape the user can read in seconds.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no application layer. It decides how work is proven and
reported; the skill that owns the layer decides what code to write.

## Required workflow

1. Before starting, write the acceptance checks: the observable outcomes the
   request names, and the non-goals it rules out. A check you cannot observe is
   not a check yet; turn "make it work" into a command, a rendered state, or a
   test case.
2. While working, decide reversible choices yourself and log each one as
   `Ruling: <choice>; why: <reason>; if wrong: <cost>`. Stop and ask only before an
   action that cannot be undone, a security-sensitive change, an effect
   outside the workspace (push, publish, send, deploy), or a request that
   cannot be followed as written.
3. Before each claim, name the proof, run it in the current state, and read
   its output. Use the claim table below.
4. Label every check `pass`, `fail`, `unavailable` (the tool or environment is
   missing), or `blocked` (it needs something from the user). Stop when the
   acceptance checks pass; polish after that is a new task.
5. Report in the shape below.

## Claims and their proof

| Claim | Proof | Not proof |
| --- | --- | --- |
| Tests pass | The test command run after the last edit, showing 0 failures | An earlier run; "should pass" |
| Types or build pass | The type-check or build command exiting 0 | The linter passing |
| Bug fixed | The original reproduction now behaves correctly | The code changed |
| A regression test guards the fix | It fails without the fix and passes with it | It passes once |
| UI works | The state rendered and observed, in a browser or a rendering test | It compiles |
| A subagent finished | The diff or file shows the change | The subagent says so |
| Requirement met | Each acceptance check is labeled `pass` | The tests are green |

When the proof cannot run, the claim becomes a `Not checked:` item, never a
softened "should work".

## Review comments you receive

Treat each comment as a claim about the code. Check it against the code, then
implement it when it holds, answer with the evidence when it does not, and ask
when it is unclear. Work one comment at a time, and skip thanks and praise.

## Report shape

1. **Result:** the first line answers what was asked: done, partly done, or
   not done, and why.
2. **Checks:** one line each, `<label> | <command or check> | <what it showed>`.
3. **Rulings:** the `Ruling:` lines that shaped the result, if any.
4. **Handoff:** one `Skipped:` line and one `Not checked:` line.

Keep every negation, number, path, command, and error text exactly as it is.
Write warnings, irreversible steps, and questions to the user as full
sentences. Start with the result rather than an announcement, and end with
the handoff lines rather than a recap or an offer.

Write each review finding you give as one line:
`<path>:<line> [blocker|major|minor] <problem>. <fix>.`

Ask a subagent for `<path>:<line>` citations and a one-line verdict, not
prose, so its result costs the main context little.

## Smallest complete change

Run only the proof the claims need. Take the first option that fully works:

1. Reuse a result that is still current: same files, same state.
2. Run the focused check: one test file, one type-check project, one page.
3. Run the repository gate (for example `npm run validate`) when the change
   reaches shared code, and once before handoff when the repository has one.
4. Add a test only when an acceptance check names behavior no existing check
   covers.

- Never cut the proof for a claim you make, the report of a failing check,
  security checks, or anything the user asked for.
- Mark a deliberate limit in code with `// shortcut: <limit>, <when to
  upgrade>`, and name it in the `Skipped:` line.
- End the handoff with one `Skipped:` line for what was left out on purpose
  and one `Not checked:` line for what could not be verified.

## Companion skill routing

- A product rule that needs a new test belongs to `$write-feature-tests`,
  which owns case tables and rule-change tests.
- A check that fails for a reason you cannot yet name goes to
  `$debug-from-root-cause` before any fix.
- A ruling that later sessions should know becomes a memory through
  `$keep-project-memory`.
- What code to write, and in which layer, stays with the skill that owns that
  layer: `$build-composable-components`, `$build-forms`,
  `$manage-server-state`, or `$feature-sliced-design`.
- If a useful companion is not installed, explain its concrete benefit once
  and ask before installing it. Continue without it if the user declines.
