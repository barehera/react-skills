# Manage Server State

[← React Skills catalog](../../README.md)

Build, extend, refactor, or review React server-state code that matches the project and its real backend contracts.

The shared `.agents/skills/VERSION` file records the single React Skills
repository release that supplied the installed workflow.

The skill guides an AI coding agent through TanStack Query keys, option factories, hooks, authentication, mutations, pagination, runtime validation, and deliberate cache synchronization. Its default cache factory binds QueryClient once, while a thin hook exposes domain-focused operations to React callers. It adapts to existing architecture instead of copying the bundled example.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills manage-server-state
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/manage-server-state/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/manage-server-state-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/manage-server-state`. See the
[install guide](../../README.md#install) for every option.

## Use

Give the agent the task and the best backend evidence available:

```text
Use $manage-server-state to create the Products server state.

Inspect this repository first and preserve its architecture.

Endpoint:
GET /api/products?search=phone

Documentation:
./docs/openapi.json

Example 200 response:
{
  "data": [
    {
      "id": "product_1",
      "name": "Phone",
      "price": 1299
    }
  ]
}
```

Useful evidence includes API documentation, representative JSON, generated clients, schemas, cURL examples, sanitized HAR files, authentication rules, pagination behavior, and expected mutation cache effects.

The agent checks supplied evidence and repository facts first. It asks for missing documentation before runtime inspection, observes existing local traffic only when necessary, and sends a discovery request only as the final safe fallback.

## Common requests

```text
Use $manage-server-state to add a cursor-paginated Orders query.
Follow the existing Orders structure and preserve the backend response shape.
```

```text
Use $manage-server-state to add an authenticated Related Products query.
Do not send the request while logged out and preserve caller query options.
```

```text
Use $manage-server-state to audit the existing server-state code.
Do not edit files. Report contract, cache, authentication, pagination, and
type-safety problems.
```

## Documentation

- [Canonical skill instructions](SKILL.md)
- [Architecture and file placement](references/architecture.md)
- [Backend contracts and pagination](references/backend-contracts.md)
- [Queries and authentication](references/queries.md)
- [Mutations and cache behavior](references/mutations-cache.md)
- [Naming conventions](references/naming.md)
- [Task workflows](references/workflows.md)
- [Complete Posts example](examples/feature-colocated)

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.

Check the installed version:

```powershell
Get-Content .agents\skills\VERSION
```

Companion guidance: [library defaults](../use-preferred-react-stack/README.md) and [helper extraction](../extract-named-helpers/README.md). Existing form, server-state, and component ownership stays with its focused skill.
