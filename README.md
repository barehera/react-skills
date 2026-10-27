<div align="center">
  <h1>React Skills</h1>
  <p><strong>A growing catalog of maintainable Agent Skills for React development.</strong></p>

  <p>
    <a href="https://agentskills.io"><img alt="Agent Skills" src="https://img.shields.io/badge/Agent_Skills-open_standard-7C3AED?style=for-the-badge"></a>
    <a href="https://ui.shadcn.com/docs/registry"><img alt="shadcn Registry" src="https://img.shields.io/badge/shadcn-registry-111827?style=for-the-badge&logo=shadcnui&logoColor=white"></a>
    <a href="https://react.dev"><img alt="React" src="https://img.shields.io/badge/React-development-149ECA?style=for-the-badge&logo=react&logoColor=white"></a>
  </p>
</div>

## What is this?

React Skills gives repository-aware AI coding agents focused workflows for building clean, consistent React applications.

Each skill is independently documented and installable, while the catalog is
released as one versioned unit. The GitHub `v*` release is canonical; root
`VERSION`, package metadata, the selector, and installed skills are synchronized
copies of that release number.

The catalog is intentionally opinionated. Its canonical skeleton uses React,
TypeScript, shadcn/Radix primitives, compound components, React Hook Form, Zod,
scoped Zustand stores, TanStack Query, Axios, Vitest, and focused feature ownership.
Skills inspect a consuming repository before changing it, but source skills and
examples do not become framework-neutral menus of interchangeable packages.
Every skill places code in one of three layers: primitives (shadcn/Radix),
composable families (compound roots and slots with no product knowledge), and
feature adapters (screens, schemas, queries, mutations, and product rules).
See the [technology contract](docs/technology-stack.md) for the shared stack,
the layer model, and responsibility boundaries.

## Available skills

| Skill | Purpose |
| --- | --- |
| [Build Forms](skills/build-forms/README.md) | Build accessible React forms on the incumbent typed form factory, with compact field adapters, typed slot props, and independent workflow orchestration. |
| [Manage Server State](skills/manage-server-state/README.md) | Build, extend, refactor, and audit type-safe React server state around real backend contracts. |
| [Build Composable Components](skills/build-composable-components/README.md) | Design and refactor component families with preserved base contracts, slot-owned props, scoped state, and correct async boundaries. |
| [Document Business Logic](skills/document-business-logic/README.md) | Preserve non-obvious product rules without inline implementation narration. |
| [Evolve Skills from Feedback](skills/evolve-skills-from-feedback/README.md) | Capture evidence from real projects and turn it into validated, durable skill improvements. |
| [Feature-Sliced Design](skills/feature-sliced-design/README.md) | Design, migrate, and audit scalable React application structure around feature ownership, runtime boundaries, and direct imports. |
| [Extract Named Helpers](skills/extract-named-helpers/README.md) | Extract focused helpers without needless indirection. |
| [Derived Types](skills/derived-types/README.md) | Derive component, hook, and helper types from one owner so they follow server, form, and store changes. |
| [Keep Project Memory](skills/keep-project-memory/README.md) | Remember project decisions, gotchas, and preferences across sessions in plain Markdown files. |
| [Verify and Report](skills/verify-and-report/README.md) | Prove every claim before making it and report results in a compact, fixed shape. |
| [Debug from Root Cause](skills/debug-from-root-cause/README.md) | Find the mechanism behind a bug, fix it in the owning layer, and lock it with a regression test. |
| [Map Project Modules](skills/map-project-modules/README.md) | Keep a one-page Markdown map of modules, entry points, and hub files, and search through it. |
| [Use Preferred React Stack](skills/use-preferred-react-stack/README.md) | Choose verified React libraries by concern. |
| [Write Feature Tests](skills/write-feature-tests/README.md) | Lock product rules with reusable case tables and a baked-defaults contract. |

More skills can be added without changing the installation workflow.

The composable-component skill covers the cases that usually break down as a
design system grows: extending shadcn and Radix contracts, `cva` size and
variant on the container part read through `data-*` attributes, families that
know only UI while the consumer maps query data and status parts inside the
list, record parts that read the record once, controlled optional values,
per-root Zustand stores, persistent overlays, and optimistic server-state
boundaries. Its worked examples progress from ordinary props to advanced and
expert compound families.

## Install

Run the installer from your project root:

```bash
npx --yes github:barehera/react-skills
```

1. **Pick where.** This project, or every project for your user; see
   [Install for every project](#install-for-every-project).
2. **Pick skills.** `↑` / `↓` move, `Space` selects, `a` toggles all, and
   `Enter` continues.
3. **Pick your agents.** Agents already set up in the project, such as a
   `.cursor` folder, are pre-selected.
4. **Pick companions.** Optional third-party packs for those agents; see
   [Companion packs](#companion-packs).
5. **Done.** shadcn writes the files, and the installer keeps them out of git.

Press `Ctrl+C` at any point to cancel.

Every skill lands once in `.agents/skills/<skill>/`. Most agents read that
folder directly, so they need nothing else; three get one pointer file:

| Agent | `--agent` | Extra file for each skill |
| --- | --- | --- |
| Cursor | `cursor` | None |
| GitHub Copilot (VS Code, CLI, cloud agent) | `copilot` | None |
| Windsurf / Devin | `windsurf` | None |
| Codex | `codex` | None |
| Gemini CLI / Antigravity | `gemini` | None |
| OpenCode | `opencode` | None |
| Claude Code | `claude` | `.claude/skills/<skill>/SKILL.md` |
| Kiro | `kiro` | `.kiro/skills/<skill>/SKILL.md` |
| Cline | `cline` | `.cline/skills/<skill>/SKILL.md` |

Amp, Roo Code, Junie, and Zed also read `.agents/skills`; install with any
agent and they find the skills. The editor decides which files it reads, not
the model: Cursor running Claude, Gemini, or GPT models reads the same
`.agents/skills`, so pick `cursor`, not `claude`, for Cursor.

A pointer sends its agent to the canonical `SKILL.md`. The installer also
writes `.agents/skills/VERSION`, the React Skills release, and
`.agents/skills/react-skills.json`, your skills, agents, and companions.

### Keep the skills out of git

After each install or update, the installer lists every React Skills path in
the repository's `.git/info/exclude`. Git reads that file like `.gitignore` but
never commits it, so the skills stay on your machine and teammates see no
change. Files that are already committed stay tracked; the installer names them
and prints the `git rm -r --cached` command that keeps them local only. To share
the skills with your team instead, commit them with `git add -f`. Installing
with shadcn directly does not change `.git/info/exclude`.

### Install without questions

```bash
npx --yes github:barehera/react-skills build-forms manage-server-state --agent cursor
npx --yes github:barehera/react-skills --all --agent claude,cursor --companions karpathy
```

| Option | What it does |
| --- | --- |
| `--agent <ids>` | Agent ids from the table above, comma-separated. Saved for updates. |
| `--companions <ids>` | Companion packs to add, comma-separated, or `none`. Never chosen by `--yes`. |
| `--all` | Every skill in the catalog. |
| `--overwrite` | Replace existing React Skills files without asking. |
| `--prune` | Remove React Skills pointer files for agents you did not pick. |
| `--dry-run` | Show what would change without writing. |
| `--yes` | Accept every default without asking. |
| `--global`, `-g` | Install for your user in every project instead of this project. |
| `--cwd <path>` | Install into another folder. |

See the skills, agents, and companions without installing:

```bash
npx --yes github:barehera/react-skills list
```

### Install for every project

```bash
npx --yes github:barehera/react-skills --global
npx --yes github:barehera/react-skills --global --all --agent claude,cursor --companions karpathy
npx --yes github:barehera/react-skills update --global
```

`--global` (or `-g`, or "Every project" in the selector) installs the skills
for your user, the same way the companion packs install. The
[skills CLI](https://github.com/vercel-labs/skills) puts each skill once in
`~/.agents/skills/<skill>/`, which Cursor, Copilot, Codex, Gemini CLI,
OpenCode, and Cline read, and links it into `~/.claude/skills`,
`~/.codeium/windsurf/skills`, or `~/.kiro/skills` for Claude Code, Windsurf,
and Kiro. Every agent reads the full skill, so no pointer file is needed. Your
selection and the release live in `~/.agents/skills/react-skills.json` and
`VERSION`; `update --global` reinstalls them from the latest release. Projects
stay untouched, so nothing goes into git. Install a skill either globally or
in a project, not both, or the agent sees it twice.

### Install as a plugin or extension

The repository is also a plugin for every agent with a plugin channel. A plugin
installs all skills for your user, in every project, and updates through the
agent; the installer above picks skills per project.

| Agent | Commands |
| --- | --- |
| Claude Code | `/plugin marketplace add barehera/react-skills`, then `/plugin install react-skills@react-skills` |
| Codex | `codex plugin marketplace add barehera/react-skills`, then `codex plugin add react-skills@react-skills` |
| GitHub Copilot CLI | `copilot plugin marketplace add barehera/react-skills`, then `copilot plugin install react-skills@react-skills` |
| Gemini CLI | `gemini extensions install https://github.com/barehera/react-skills` |
| Cursor | Use the installer; `.cursor-plugin/plugin.json` is ready for a local or marketplace plugin |

Use one route per agent: a plugin and a project install of the same skill load
it twice.

### Install with shadcn directly

Every skill has one registry item, plus one per pointer agent. A pointer item
installs the skill too:

```bash
npx shadcn@latest add barehera/react-skills/build-forms
npx shadcn@latest add barehera/react-skills/build-forms-claude
```

The first line is all Cursor, Copilot, Windsurf, Codex, Gemini CLI, and
OpenCode need. Pointer items end in `-claude`, `-kiro`, or `-cline`. Review an
item before installing it:

```bash
npx shadcn@latest view barehera/react-skills/build-forms
npx shadcn@latest add barehera/react-skills/build-forms-claude --dry-run
```

### Companion packs

The installer offers third-party packs after the skills, for the agents you
picked. None is installed without your choice. Packs are personal tools, so
they install for your user, not into the project, through the best channel
each agent has:

| Id | Pack | Claude Code | Other agents | What to know |
| --- | --- | --- | --- | --- |
| `karpathy` | [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) | Plugin | `npx skills` | Recommended. A short rule set that agrees with the skills: think first, simplest code, surgical diffs. |

`npx skills` is the [skills CLI](https://github.com/vercel-labs/skills) and
needs Node 22.20 or later. Without the `claude` command on your PATH, Claude
Code gets the skills through `npx skills` and the installer prints the
`/plugin` commands. Packs bring their own instructions; when one disagrees
with a skill about code that skill owns, tell the agent to follow the skill.

Earlier releases offered heavier packs. The catalog now keeps their useful
ideas in its own skills, as plain files with no hooks, background processes,
or session-start text:

| Former pack | Replaced by | What it kept |
| --- | --- | --- |
| claude-mem | [Keep Project Memory](skills/keep-project-memory/README.md) | Index-first recall, save what was learned, no duplicates |
| Superpowers | [Verify and Report](skills/verify-and-report/README.md), [Debug from Root Cause](skills/debug-from-root-cause/README.md) | Proof before claims, root cause before fixes, decide and log |
| Caveman | [Verify and Report](skills/verify-and-report/README.md) | Result first, exact numbers and errors, one-line findings |
| Graphify | [Map Project Modules](skills/map-project-modules/README.md) | A module map, hub files, search before reading |

Ponytail is not offered either: every skill's `Smallest complete change`
section already carries its ladder and handoff lines.

## Update

```bash
npx --yes github:barehera/react-skills update
```

`update` reinstalls your saved skills for your saved agents from the latest
release, replaces their files, and lists catalog skills you have not installed
yet. Without a saved selection, for example after installing with shadcn
directly or with an older installer, it finds the installed skills and asks for
your agents once. Companion packs update through their own channel.

- Add a skill with your saved agents:
  `npx --yes github:barehera/react-skills write-feature-tests`
- Change agents: `npx --yes github:barehera/react-skills update --agent cursor,claude`
- Remove pointer files for agents you do not use:
  `npx --yes github:barehera/react-skills update --agent cursor --prune`.
  Only generated React Skills pointers are removed; a file you rewrote so it no
  longer points to its skill is kept.

### Upgrade from v4

v5 stops writing `.cursor/rules/<skill>.mdc`,
`.github/instructions/<skill>.instructions.md`, and `.windsurf/rules/<skill>.md`:
those agents read `.agents/skills` now, and the old rule would load each skill
twice. Any install or update removes the generated ones and keeps any you
rewrote. The shadcn items ending in `-cursor`, `-copilot`, and `-windsurf` are
gone; use the skill item itself.

## Use an installed skill

Name the skill in your request:

```text
Use $manage-server-state to add the Products server state.
Inspect this repository and its API documentation before writing code.
```

### Ask for senior-quality UI

Current models follow a request closely, so the request sets the quality bar.
Say who the work is for, the problem they have, what done looks like, and
point at two or three examples:

```text
Use $build-composable-components to build the shift handover screen.
Who: our ops manager reviews 40 handovers a shift and misses the ones with
open incidents.
Done: open incidents come first, it works at phone width, loading, empty, and
error states read clearly, and a keyboard user can resolve a handover.
Examples: the incident list in features/incidents and the Linear inbox.
Go beyond the basics: add a count of open incidents and sort by severity.
```

The who, the problem, and the done list carry the effect. Hype such as "make
them say WOW" or "a senior engineer must think you wrote it" adds little on
current models, and capitals or "MUST" make them overreact; the
[2026-10-22 decision ledger](docs/skill-feedback/2026-10-22-companion-packs-decisions.md)
has the sources.

```text
Use $build-forms to create a multi-step onboarding form with composable shadcn
field slots. Keep Form and Stepper independent, and recommend the server-state
skill if the submission requires API and cache work.
```

```text
Use $build-composable-components to refactor this task action family.
Preserve its shadcn contracts, put size on the content as a cva, keep optional
overlays explicit, and let each call site compose the actions as child parts.
```

```text
Use $evolve-skills-from-feedback to review this completed implementation and
create an evidence-backed feedback report for the skill we used. I will bring
that report back to the skills repository for planning or implementation.
```

```text
Use $feature-sliced-design to design this Next.js application around
feature-owned slices. Keep framework routes thin, colocate server state with
its business owner, separate client and server integrations, and use no barrel
exports.
```

```text
Use $document-business-logic while refactoring this component. Default to no
comment; preserve a non-obvious product rule only when its purpose, reason, and
constraint are supported.
```

If your agent does not discover skills automatically:

```text
Read .agents/skills/manage-server-state/SKILL.md completely and follow it
for this task.
```

## Contribute through feedback

Use the feedback skill to turn a real product-project correction into a reviewable
React Skills pull request.

1. Install both the skill being tested and the feedback skill in the product
   repository:

   ```bash
   npx --yes github:barehera/react-skills build-forms evolve-skills-from-feedback
   ```

2. Complete a real task with the target skill. Keep the accepted implementation,
   user corrections, relevant diff, and test output available.
3. Ask the agent to capture the evidence:

   ```text
   Use $evolve-skills-from-feedback in capture mode for $build-forms.
   Record my corrections, the accepted implementation, exact file evidence,
   generalization boundaries, and observable acceptance criteria.
   ```

4. Review the report at
   `.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md`. It must follow the
   [feedback format](skills/evolve-skills-from-feedback/references/feedback-format.md)
   and start from the
   [report template](skills/evolve-skills-from-feedback/assets/skill-feedback-template.md).
5. Validate it in the product repository:

   ```bash
   node .agents/skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs \
     .agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md
   ```

6. Open a focused branch in this repository, preserve the report as evidence or
   link it when the source cannot be published, and ask the agent to ingest it:

   ```text
   Use $evolve-skills-from-feedback in ingest mode for this report.
   Compare every finding with the current source skill, produce a decision
   ledger, implement accepted changes, and run the repository validation.
   ```

7. Run `npm run validate`, then open the pull request using the repository
   template. Include the target skill/version, report path, finding decisions,
   stack alignment, validation results, and unresolved assumptions.

Feedback-only pull requests are welcome when the evidence is ready but the
source change is not. Redact secrets, private endpoints, customer identifiers,
and unnecessary proprietary code. See
[Adding or improving a skill](docs/adding-a-skill.md) for the full authoring and
pull-request workflow.

## Repository organization

Every skill owns its instructions, references, examples, adapters, documentation, and registry item under `skills/<skill-name>`. The root registry composes those independent items into one catalog.

See [Adding or improving a skill](docs/adding-a-skill.md) for the required
structure, preferred stack, feedback loop, and validation workflow.
