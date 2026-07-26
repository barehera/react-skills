# Manage Server State

[← React Skills catalog](../../README.md)

Build, extend, refactor, or review React server-state code that matches the project and its real backend contracts.

The skill guides an AI coding agent through TanStack Query keys, option factories, hooks, authentication, mutations, pagination, runtime validation, and deliberate cache synchronization. It adapts to existing architecture instead of copying the bundled example.

## Install

```bash
npx shadcn@latest add barehera/react-skills/manage-server-state
```

The canonical instructions are installed at:

```text
.agents/skills/manage-server-state/SKILL.md
```

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
- [Feature-colocated and server-state-rooted placement](references/placements.md)
- [Backend contracts and pagination](references/backend-contracts.md)
- [Queries and authentication](references/queries.md)
- [Mutations and cache behavior](references/mutations-cache.md)
- [Naming conventions](references/naming.md)
- [Task workflows](references/workflows.md)
- [Prompts and code patterns](references/examples.md)
- [Complete Posts example](examples/feature-colocated)

## Update

```bash
npx shadcn@latest add barehera/react-skills/manage-server-state --overwrite
```
