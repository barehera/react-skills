# Debug from Root Cause

Stop the guess-and-patch loop: the agent reproduces the failure, names the one
mechanism that explains it, fixes it in the layer that owns the defect, and
locks it with a regression test that failed before the fix.

It edits no product code until it can state the cause in one sentence, and
after three fixes that did not hold it stops and questions the design with you
instead of trying a fourth.

## Install

From your project root:

```bash
npx --yes github:barehera/thinstack debug-from-root-cause
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/debug-from-root-cause/`, which Cursor, GitHub Copilot,
Windsurf, Codex, Gemini CLI, and OpenCode read directly, plus one pointer for
Claude Code, Kiro, or Cline. Skip the question with `--agent`, for example
`--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/thinstack/debug-from-root-cause
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the [install guide](../../README.md#install) for every option.

## Use it

```text
Use $debug-from-root-cause: the order list shows yesterday's data after a
mutation until I reload.
```

```text
Investigate why the date picker closes when I press Tab, but don't fix it yet.
```

```text
The build fails on CI but not locally. Find the cause.
```

## Example report

```text
Symptom: "Order list shows stale rows after Cancel order until reload."
Cause: the cancel mutation invalidates ["orders"], but the list query key is ["orders", "list", filters].
Proof: the devtools cache shows the list entry is never marked stale after the mutation.
Fix: features/orders/queries.ts (feature adapter): invalidate orderKeys.lists().
Regression test: "cancel marks order lists stale", fails before and passes after
Skipped: none.
Not checked: the same flow on the mobile layout.
```

## Update

```bash
npx --yes github:barehera/thinstack update
```

This updates all installed Thinstack skills for the agents you chose.
