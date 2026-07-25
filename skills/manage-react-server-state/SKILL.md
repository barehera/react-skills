---
name: manage-react-server-state
description: Create, extend, refactor, or audit type-safe React server-state code while adapting to the repository's existing architecture, backend contracts, transport, authentication, validation strategy, and naming. Use for TanStack Query features, API operations, query keys and options, hooks, mutations, pagination, cache synchronization, authenticated requests, or establishing a server-state structure from scratch.
---

# Manage React Server State

Build reliable backend integration that feels native to the project. Treat the bundled implementation as a reference, never as a directory template to copy blindly.

## Operating rule

Separate decisions into three groups:

1. Preserve project facts: repository instructions, existing layout, public imports, transport, generated types, auth, error handling, and backend contracts.
2. Enforce correctness: stable cache identity, complete query keys, cancellation, safe auth gating, accurate pagination, deliberate cache effects, and one consistent vocabulary.
3. Apply defaults only when the project has no convention. State important defaults before creating a new architecture.

## Required workflow

1. Read repository instructions and inspect manifests, aliases, neighboring features, API clients, QueryClient setup, auth integration, backend types/schemas, and validation commands.
2. Classify the request as `create from scratch`, `create feature`, `add endpoint`, `refactor`, or `audit`.
3. Build a short project profile: placement, file granularity, naming, transport, contract source, runtime validation, auth, error handling, pagination, and cache conventions.
4. Derive the endpoint contract from code, generated clients, documentation, examples, or the user. Never invent routes, fields, envelopes, page parameters, or auth requirements.
5. Ask only questions whose answers cannot be inspected and would materially change the result. Combine related questions. If the user delegates the choice, use the project convention or the defaults in the references and state the choice.
6. Read only the references needed for the task:
   - [architecture.md](references/architecture.md) for placement, dependency direction, and adapting file structure.
   - [naming.md](references/naming.md) for the project vocabulary and migration rules.
   - [backend-contracts.md](references/backend-contracts.md) for contract intake, validation, errors, or pagination.
   - [queries.md](references/queries.md) for keys, factories, hooks, overrides, and authentication.
   - [mutations-cache.md](references/mutations-cache.md) for mutations, optimistic updates, and cache effects.
   - [workflows.md](references/workflows.md) for questions and task-specific procedures.
   - [examples.md](references/examples.md) before creating a new architecture or when a concrete pattern would help.
7. Implement the smallest coherent change. Do not migrate unrelated code during an endpoint task.
8. Run the repository's existing formatting, lint, typecheck, test, and build commands in proportion to risk. Do not introduce a test framework unless requested.
9. Report files changed, commands run, decisions made, backend assumptions, and unresolved contract gaps.

## Defaults, not mandates

When no project convention exists, prefer:

- Feature-colocated remote state with direct imports and one hook per operation.
- `detail` as the single-resource read name; `list`, `infiniteList`, `create`, `update`, and `delete` for common operations.
- Object inputs for public operations so parameters can grow safely.
- Query option factories as the source of `queryKey` and `queryFn`, with thin hooks as the component API.
- Runtime validation for untrusted serialized data, unless generated backend types are the established source of truth.
- The project's existing Axios, fetch, or generated-client transport instead of adding another client.
- `set`, `patch`, `invalidate`, and `remove` for cache actions; reserve `delete` for the backend mutation.
- No barrel exports in a new structure. Preserve existing public entry points during a scoped refactor unless removal is requested.

Do not force `src/features`, Zod, Axios, Query Key Factory, shared response envelopes, a global `server-state` folder, or the reference example's file boundaries onto a project that uses a different coherent approach.

## Reference implementation

The complete feature-colocated example is under [examples/feature-colocated](examples/feature-colocated). It demonstrates shared primitives, a Posts feature, finite and infinite queries, context keys, an authenticated-query factory, mutations, and cache actions.

Copy its reasoning, not its backend contract or paths. Replace every route, schema, type, auth import, pagination field, default, and cache rule with verified project facts.
