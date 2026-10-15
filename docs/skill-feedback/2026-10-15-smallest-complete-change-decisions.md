# October 15 2026 smallest complete change decisions

## Source and evidence

- [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
  (MIT, v5), a skill that asks an agent to solve the whole task with the least
  new code, reuse before writing, and never cut safety. Its ideas are adapted
  in our own words; no text is copied, and no `SKILL.md` names it.
- The repository owner's constraint: the stack, the three-layer model, compound
  APIs, compact field adapters, the typed form factory, scoped Zustand, Query
  option factories, case tables, "used twice, extract once", and typed
  `size`/`variant` treatments stay unchanged. The new rule works inside them.
- One pull request per skill adds the section; this ledger and
  [the technology contract](../technology-stack.md#smallest-complete-change)
  hold the catalog-wide rule.

## Decisions

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Smallest-change ladder | adapted | `docs/technology-stack.md`; a `## Smallest complete change` section in every `SKILL.md` | Rungs are per layer, and a house shadcn/Radix primitive comes before a native widget so the design system stays the default |
| Never-cut list | accepted | Technology contract and each skill's ladder | Zod parsing at trust boundaries, error handling that prevents data loss, auth and security, accessibility contracts, and anything the user asked for survive any shortcut |
| Finish every place the change reaches | accepted | Technology contract and each skill's ladder | Callers, tests, fixtures, and exports are part of the change, not follow-up work |
| `// shortcut: <limit>, <when to upgrade>` marker | accepted | Technology contract; `document-business-logic` keeps it as a technical comment | A deliberate limit is visible at the call site with its upgrade trigger |
| `Skipped:` / `Not checked:` handoff lines | accepted | Each skill's final report step | The reviewer sees what was left out on purpose and what was not verified |
| Lite, full, and ultra session levels | rejected | n/a | Catalog skills are task-scoped, not session modes |
| Plain-English Must/Should/Nice review and audit report format | needs-evidence | Proposed follow-up review skill | A review format is its own trigger and workflow; it needs a separate skill and evidence |
| Shortcut debt ledger command | deferred | With the follow-up review skill | It only pays off once a review workflow consumes the markers |
| Gain scoreboard | rejected | n/a | We never claim savings we did not measure |
| Ponytail's benchmark numbers | not adopted | n/a | Our own skill-bench run on these pull requests is pending owner approval |

## Enforcement

`npm run validate` fails for any `SKILL.md` without a
`## Smallest complete change` section; the quality contract in
[adding-a-skill.md](../adding-a-skill.md) checks the ladder's content by
review. The ten skill pull requests were combined into one with this check.

## Known gaps and follow-ups

- No benchmark measures the ladder yet; run skill-bench on the ten skill pull
  requests once the owner approves the cost.
- The review skill with the Must/Should/Nice format and the shortcut debt
  ledger needs its own evidence and proposal.
