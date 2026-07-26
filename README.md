<div align="center">
  <h1>🧠 React Server State Skill</h1>
  <p><strong>Give your AI coding agent a consistent way to build type-safe React server state.</strong></p>

  <p>
    <a href="https://agentskills.io"><img alt="Agent Skills" src="https://img.shields.io/badge/Agent_Skills-open_standard-7C3AED?style=for-the-badge"></a>
    <a href="https://tanstack.com/query/latest"><img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query-compatible-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"></a>
    <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-type_safe-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
  </p>
</div>

## What is this?

`manage-react-server-state` is an Agent Skill for creating, extending, refactoring, and reviewing React server-state code.

It teaches an AI agent to:

- Inspect your project before writing code.
- Follow your existing folder structure and naming.
- Use your real backend routes, types, authentication, errors, and pagination.
- Create type-safe TanStack Query keys, options, hooks, mutations, and cache helpers.
- Ask for missing backend details instead of inventing them.

This is not a runtime package and does not copy a fixed architecture into your application. The included Posts feature is an example the agent can study and adapt.

## Install

Run this command from your project root:

```bash
npx shadcn@latest add barehera/server-state-registry/manage-react-server-state
```

The skill is installed at:

```text
.agents/skills/manage-react-server-state/SKILL.md
```

## Use it

Ask your coding agent to use the skill and describe the work you need:

```text
Use $manage-react-server-state to create the Products server state.

Inspect this repository first and follow its existing architecture.

GET /api/products?search=
Response: { "data": Product[] }

GET /api/products/:productId
Response: { "data": Product }

Product: { id: string, name: string, price: number }

Ask me for any missing backend details that affect correctness.
```

Provide whatever backend information you already have:

- Routes and HTTP methods.
- Path, query, and body parameters.
- Success and error response shapes.
- Generated backend types or schema files.
- Authentication requirements.
- Pagination fields and end-of-list behavior.
- Expected cache updates after mutations.

The agent should inspect the repository first, reuse facts it can verify, and ask only for important missing information.

## Common tasks

### Add an endpoint

```text
Use $manage-react-server-state to add a cursor-paginated Orders query.
Follow the existing Orders structure and preserve the backend response shape.

GET /api/orders?cursor=<string>&limit=<number>
Response: { "data": Order[], "meta": { "nextCursor": string | null } }
```

### Add an authenticated query

```text
Use $manage-react-server-state to add the Related Products query.
Reuse the project's authentication logic and prevent the request while logged out.
Preserve caller-provided select and enabled options.
```

### Review existing code

```text
Use $manage-react-server-state to review the existing server-state code.
Do not change files yet. Report problems with backend fidelity, query keys,
authentication, pagination, cancellation, and mutation cache behavior.
```

## What it standardizes

When your project does not already have a convention, the skill uses these defaults:

| Purpose | Name |
| --- | --- |
| Finite collection | `list` |
| Infinite collection | `infiniteList` |
| Single resource | `detail` |
| Mutations | `create`, `update`, `delete` |
| Complete cache write | `set` |
| Partial cache write | `patch` |
| Mark cache stale | `invalidate` |
| Remove cached data | `remove` |

It also favors object inputs, complete query keys, reusable query-option factories, thin hooks, explicit cache effects, request cancellation, backend-owned types, and centralized defaults.

## AI tool support

The canonical skill works with repository-aware coding agents. Native skill discovery and invocation differ by tool, so use the portable prompt below whenever direct naming does not activate it.

| Tool | Usage |
| --- | --- |
| OpenAI Codex, Cursor | Name `manage-react-server-state` in the prompt or select it from the available skills/rules. |
| Gemini CLI, Antigravity, GitHub Copilot | Name `manage-react-server-state` after installation; use the portable prompt if it is not discovered automatically. |
| Claude Code, DeepSeek, other file-aware agents | Use the portable prompt to load the installed `SKILL.md` directly. |

Portable prompt:

```text
Read .agents/skills/manage-react-server-state/SKILL.md completely and follow it
for this task. Inspect the repository before proposing a structure and do not
invent missing backend contracts.
```

## Update

Re-run the install command with `--overwrite`, then review the changes:

```bash
npx shadcn@latest add barehera/server-state-registry/manage-react-server-state --overwrite
```

## Learn more

- [Skill instructions](skills/manage-react-server-state/SKILL.md)
- [Architecture and file placement](skills/manage-react-server-state/references/architecture.md)
- [Backend contracts and pagination](skills/manage-react-server-state/references/backend-contracts.md)
- [Queries and authentication](skills/manage-react-server-state/references/queries.md)
- [Mutations and cache behavior](skills/manage-react-server-state/references/mutations-cache.md)
- [Naming conventions](skills/manage-react-server-state/references/naming.md)
- [Complete Posts example](skills/manage-react-server-state/examples/feature-colocated)
