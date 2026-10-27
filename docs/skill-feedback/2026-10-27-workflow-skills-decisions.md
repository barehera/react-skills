# October 27 2026 workflow skills decisions

## Source and evidence

- After `keep-project-memory` replaced claude-mem, the repository owner asked
  for the same treatment of the remaining heavy companion packs: build light
  in-house skills, drop Superpowers, Caveman, and Graphify, and add the
  "match the form to the failure" rule to `evolve-skills-from-feedback`.
- Packs read on 2026-10-27 (sources only, nothing executed):
  - [obra/superpowers](https://github.com/obra/superpowers) v7.0.1, commit
    `2ce8aa1`, MIT. 15 skills, 3,331 `SKILL.md` lines; 10 exceed our 220-line
    limit. A SessionStart hook injects the `using-superpowers` skill inside
    `<EXTREMELY_IMPORTANT>` at every start, clear, and compaction (about 850
    tokens), including a "1% chance a skill applies" rule. Gates: design doc,
    plan, worktree, TDD "delete the code", review after every task.
  - [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) v4.0.1,
    commit `9b68f7e`, Apache-2.0. 19 skills and a CLI of about 22K lines.
    Terse mode is on by default (`getDefaultMode` returns `caveman`). Hooks
    inject about 1.1K tokens at session start and in every subagent, plus about
    120 tokens on every prompt. The CLI sends telemetry by default to a
    Supabase function unless `DO_NOT_TRACK=1`. Its own `HONEST-NUMBERS.md`
    measures a 3% output saving over the instruction "Answer concisely."
  - [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)
    v0.9.97, commit `0a8cd4e`, Apache-2.0. A 793-line skill with per-agent
    copies, 30 Python dependencies, tree-sitter parsing, a global `CLAUDE.md`
    edit, and opt-in PreToolUse hooks on Read, Grep, Glob, and Bash. Its only
    code benchmark is one large repository at about 140K tokens per question.
  - [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills),
    one 67-line skill, no hooks.

## Decisions

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Session-start injection, per-prompt hooks, and "invoke a skill at 1% chance" | rejected | n/a | Catalog skills are task-scoped and model-invoked; injected text is paid on every session whether or not it helps |
| Design-doc, plan, worktree, and review-after-every-task gates | rejected | n/a | They add steps to small tasks, against the smallest complete change contract |
| Verification gate: name the proof, run it, read it, then claim | accepted | `verify-and-report` claim table | Highest value per line; it fills the `Not checked:` line with evidence |
| Decide reversible choices and log a ruling; stop only for irreversible, security, external, or unfollowable work | adapted | `verify-and-report` workflow step 2 | Keeps the agent moving without hiding choices |
| Review comments are claims to check, not orders | adapted | `verify-and-report` | Short and broadly useful |
| Outcome labels pass, fail, unavailable, blocked; stop when acceptance passes | adapted | `verify-and-report` | Makes the report scannable and ends polish loops |
| Brevity floor, result-first reports, one-line review findings, compact subagent returns | adapted | `verify-and-report` report shape | Written as a recipe, because the failure is the output's shape |
| Terse output mode in every session | rejected | n/a | The pack measures 3% over a one-line instruction; it changes every reply the user did not ask to change |
| Root cause before fix, ranked hypotheses, compare with a working case, stop after three failed fixes | adapted | `debug-from-root-cause` | Fix lands in the owning layer, which the layer model already names |
| TDD as an iron law | already-covered | `write-feature-tests` | Case tables and rule-change tests own test discipline |
| Module map, hub files, freshness commit, map then grep then read | adapted | `map-project-modules` | The useful parts of a code graph, in one Markdown page |
| Graph database, parsers, Python runtime, hooks on reads | rejected | n/a | Small gain on apps of a few hundred files, real cost on every read |
| Match the form of a rule to the failure | adapted | `evolve-skills-from-feedback` reference and workflow step | Prohibitions fix skipped rules but worsen shape problems; the skill writing these rules needs it |
| Karpathy guidelines | already-covered | Kept as the recommended companion | Already light, no hooks, and agrees with the ladder |
| Drop Superpowers, Caveman, Graphify companions | accepted | `bin/companions.mjs`, README, stack guide, installer tests | The new skills replace them. The now-unused per-platform and setup install paths were removed with them. A saved install state naming them is filtered out on update |

## Known gaps and follow-ups

- None of the three skills has a benchmark yet. Candidates: a "claim done
  without proof" task for `verify-and-report`, a planted-bug task for
  `debug-from-root-cause`, and a "find where X lives" task measuring tokens
  with and without the map.
- Installing the workflow skills by default is not done; the installer still
  asks for skills one by one or `--all`.
