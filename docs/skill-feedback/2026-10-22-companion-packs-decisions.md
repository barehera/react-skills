# October 22 2026 companion packs decisions

## Source and evidence

- The repository owner asked for six third-party Claude Code packs to install
  alongside React Skills, for their structure to be compared with ours, and for
  a check on whether "make them say WOW" prompts raise UI quality.
- Packs read on 2026-10-22:
  - [obra/superpowers](https://github.com/obra/superpowers) (MIT). Its
    15 skills run 200 to 340 lines each, and a SessionStart hook forces
    brainstorm, plan, TDD, and subagent gates.
  - [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify). A
    Python CLI plus a skill of about 790 lines. It adds PreToolUse hooks on
    reads and searches and writes to `graphify-out/`.
  - [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman). An
    89-line skill plus hooks that turn on terse output in every session and
    subagent. Its CLI sends telemetry unless `DO_NOT_TRACK=1`.
  - [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem). A
    background worker, SQLite and Chroma stores, hooks on every tool call, and
    LLM compression of what it observes.
  - [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail). A
    52-line skill plus session hooks. It was already adapted in
    [the smallest complete change ledger](2026-10-15-smallest-complete-change-decisions.md).
  - [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
    (MIT). One 65-line rule set and no hooks.
- Prompting sources:
  - [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
  - [Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
  - The current `frontend-design` skill in
    [anthropics/skills](https://github.com/anthropics/skills). It is about
    80 lines. It replaced its earlier "don't hold back" encouragement with
    concrete principles and a self-critique step.
  - Replications of emotional-stakes prompting on newer models found no
    significant effect: [arXiv 2409.20303](https://arxiv.org/abs/2409.20303)
    and [arXiv 2508.00614](https://arxiv.org/abs/2508.00614).

## Decisions

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Install the packs with React Skills | adapted | `bin/companions.mjs`, installer selector, `--companions`, README | Each pack is opt-in, as the stack guide's approval rule requires, and `--yes` never picks one. Packs are personal tools, so they install at user scope and never touch the project or git. |
| Karpathy guidelines | accepted as the recommended companion | Preselected in the selector | They are short, have no hooks, and agree with the ladder and handoff. |
| Superpowers, Caveman, claude-mem, Graphify | accepted as optional companions | Unselected in the selector, with the cost shown | Each changes every session (gates, output style, recording, read hooks), so the user chooses. |
| Ponytail | not offered | n/a | Its ladder, never-cut list, and handoff lines already live in every skill. A second copy would inject the same rule twice and drift. |
| Long, process-heavy skill files (Superpowers, Graphify) | rejected as a model | n/a | Our core files stay under 220 lines, with detail in references, which matches the best-practices guidance on concise core files and progressive disclosure. |
| Session modes and output-style levels (Caveman, Ponytail) | rejected | n/a | Catalog skills are task-scoped, as the 2026-10-15 ledger already decided. |
| "WOW", "senior engineer", and stakes framing | adapted | README "Ask for senior-quality UI" | What helps is the context: who the work is for, their problem, concrete done criteria, examples, and an explicit "go beyond the basics". Hype and pressure measure as neutral. |
| Audience and problem as requirements | accepted | `build-composable-components` workflow step 2 | The model generalizes from the stated purpose when it is read as a requirement. |
| Plain-case rules with reasons, no shouted words | accepted | Quality contract row; validator rejects `MUST`, `NEVER`, `ALWAYS`, `CRITICAL`, `IMPORTANT` in `SKILL.md` | Current models overreact to aggressive emphasis. Every skill already passes, so the check holds the line. |
| Generic "double-check your work" lines | already-covered | n/a | No skill has them. The ladder's `Not checked:` line reports gaps without asking for repeated checks. |

## v5 multi-agent install decisions

The owner asked for a major release where the packs' agent layouts are matched
and a project in Cursor (with Claude, Gemini, or GPT models), Copilot,
Gemini CLI, and the other agents gets the files it needs. Evidence:
- The skills CLI agent table: [vercel-labs/skills](https://github.com/vercel-labs/skills).
- Agent docs read on 2026-10-22:
  - [Cursor skills](https://cursor.com/docs/context/skills)
  - [Copilot agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
  - [Devin/Windsurf skills](https://docs.devin.ai/desktop/cascade/skills)
  - [Gemini CLI skills](https://geminicli.com/docs/cli/skills)
  - [OpenCode skills](https://opencode.ai/docs/skills)
  - [Kiro skills](https://kiro.dev/docs/skills)
  - [Cline skills](https://docs.cline.bot/features/skills)
- The manifests of the six packs.

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Cursor, Copilot, Windsurf/Devin, Codex, Gemini CLI/Antigravity, OpenCode, Amp, Roo, Junie, and Zed read `.agents/skills` natively | accepted | `bin/install-targets.mjs` | The canonical folder is the whole install for them. The v4 rule pointers would load every skill twice, so they are dropped and removed on update. This is the breaking change. |
| Claude Code, Kiro, and Cline need their own skills folder | accepted | One shared `adapters/pointer.md`, items `-claude`, `-kiro`, `-cline` | Same pointer, three targets |
| The model inside an editor does not change which files it reads | accepted | README install section | Cursor with Claude, Gemini, or GPT reads `.cursor`/`.agents` paths, so the user picks the editor, not the model |
| Packs ship one plugin manifest per agent channel | adapted | `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.agents/plugins/marketplace.json`, `.github/plugin/`, `gemini-extension.json` over the same `skills/` | The repository installs as a plugin wherever a plugin channel exists. The release script stamps every manifest and `skills/VERSION`, and the validator checks them. |
| Per-agent hooks, commands, and session bootstraps (Superpowers, Caveman, Ponytail) | rejected | n/a | Our skills are task-scoped and model-invoked, so nothing needs to run at session start |
| Generated always-on rule copies per agent (Ponytail, Caveman) | rejected | n/a | Glob or always-on rules duplicate a skill the agent already discovers by description |
| Companion packs on other agents | accepted | `companionPlan` | Claude Code gets the pack's plugin. Every other agent gets its skills through `npx skills add <repo> --agent … --global --yes`, and Graphify through its own CLI. claude-mem stays Claude Code only, because its skills need the plugin worker. |

## Known gaps and follow-ups

- The new agent list and plugin manifests are checked against the docs above,
  not against a live install in each agent. Smoke-test the Codex, Copilot CLI,
  and Gemini CLI plugin routes after the release.

- No benchmark measures the step 2 wording or a companion's effect on code a
  skill guides. Run skill-bench with Karpathy guidelines installed in the
  subject project once the owner approves the cost.
- The installer cannot run `claude plugin` on a machine where the `claude`
  command is not on PATH. In that case it prints the `/plugin` commands
  instead.
