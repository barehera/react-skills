# Verify and Report

Make the agent prove what it claims and report it in a shape you can read in
seconds.

Before work starts, the agent turns the request into observable acceptance
checks. While it works, it decides reversible choices itself and logs them as
`Ruling:` lines instead of stopping to ask. Before it says "done", it runs the
proof for each claim and labels the result `pass`, `fail`, `unavailable`, or
`blocked`. The report opens with the result and ends with `Skipped:` and
`Not checked:` lines.

There are no hooks, session-start text, or approval gates: the skill loads only
when its description matches the task.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills verify-and-report
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/verify-and-report/`, which Cursor, GitHub Copilot,
Windsurf, Codex, Gemini CLI, and OpenCode read directly, plus one pointer for
Claude Code, Kiro, or Cline. Skip the question with `--agent`, for example
`--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/react-skills/verify-and-report
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the [install guide](../../README.md#install) for every option.

## Use it

```text
Use $verify-and-report: add the export button, and prove it works before
you tell me it's done.
```

```text
The subagent says the migration is finished. Verify it and report.
```

```text
Here are the review comments on my PR. Check each one against the code and
tell me which hold.
```

## Example report

```text
Done: the CSV export button downloads the filtered rows.
pass | npx vitest run src/features/orders/export.test.ts | 6 passed
pass | npx tsc --noEmit | exit 0
unavailable | browser check | no dev server configured
Ruling: comma-separated, UTF-8 with BOM; why: Excel opens it correctly; if wrong: easy to switch
Skipped: column picker, not requested.
Not checked: the download in a real browser.
```

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
