---
name: manage-server-state
description: Create, extend, refactor, or audit type-safe React server-state code while adapting to the repository's existing architecture, backend contracts, transport, authentication, validation strategy, and naming. Discover contracts from user-provided documentation, raw JSON examples, generated clients, and repository evidence before using runtime inspection. Use for TanStack Query features, API operations, query keys and options, hooks, mutations, pagination, cache synchronization, authenticated requests, or establishing a server-state structure from scratch.
---

# Manage Server State

Build reliable backend integration that feels native to the project. The
bundled implementation is a reference for reasoning, not a directory template.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, cache
effects, product rules). Dependencies point downward only.

This skill owns the remote-state part of the feature adapter: transport,
contracts, query keys, hooks, mutations, and cache effects. Visual families and
primitives never import this layer; a feature component or screen calls the
hooks and passes results into families as ordinary props.

## Required workflow

1. Collect the endpoint evidence the user provides: documentation, raw
   request/response JSON, cURL, or sanitized HAR.
2. Read repository instructions and record the
   [project profile](references/architecture.md#project-profile): placement,
   file granularity, naming, transport, contract source, runtime validation,
   auth, error handling, pagination, cache conventions, and validation
   commands. Classify the task as `create from scratch`, `create feature`,
   `add endpoint`, `refactor`, or `audit`;
   [workflows.md](references/workflows.md) has the steps for each.
3. Resolve each endpoint contract in the
   [evidence order](references/backend-contracts.md#evidence-order): user
   evidence and repository facts, then a request for missing documentation or
   representative payloads, then observation of existing local application
   traffic, and a direct discovery request only as the final safe fallback.
   Never invent routes, fields, envelopes, page parameters, or auth
   requirements.
4. Ask only questions whose answers cannot be established and would materially
   change the result, and combine related questions. If the user delegates a
   choice, use the project convention or the defaults below and state it.
5. Implement the smallest coherent change. Do not migrate unrelated code during
   an endpoint task.
6. Run the repository's existing formatting, lint, typecheck, test, and build
   commands in proportion to risk. Do not introduce a test framework unless
   requested.
7. Report files changed, layout and defaults chosen, contract evidence and its
   quality, dependencies added, cache policy, commands run, any runtime
   inspection, backend assumptions, and unresolved gaps.

## Core contracts

Separate decisions into three groups:

1. Preserve project facts: repository instructions, existing layout, public
   imports, transport, generated types, auth, error handling, and backend
   contracts.
2. Enforce correctness: stable cache identity, complete query keys,
   cancellation, safe auth gating, accurate pagination, deliberate cache
   effects, and one consistent vocabulary.
3. Apply defaults only when the project has no convention. State important
   defaults before creating a new architecture.

Use response schemas to validate and infer the expected shape without making
schema drift take down the query. When parsing fails, report the mismatch and
return the raw payload as the expected output so the application can degrade
gracefully. Do not throw solely because a server response failed schema parsing.

## Companion skill routing

When the request crosses the server-state boundary, check the installed catalog:

- `$build-composable-components`: the component family that renders the data,
  its slots, root-owned visuals, and where an optimistic boundary sits.
- `$build-forms`: the form that submits to a mutation, its schema, and field
  families.
- `$document-business-logic`: whether a product rule around a request deserves
  a comment.
- `$use-preferred-react-stack`: library defaults and verified imports.
- `$extract-named-helpers`: pure helper extraction and hook boundaries. Public
  operation inputs and cache action vocabulary stay owned here; helper defaults
  do not override them.

If a useful companion is missing, explain its concrete benefit once and ask
whether to install it. Install only after approval and only through the
environment's supported installer, otherwise offer
`npx --yes github:barehera/react-skills <skill>`, which installs it for the
project's saved agents. If the user declines, continue and do not ask again.

## References

- [architecture.md](references/architecture.md): project profile, placement,
  shared code, dependency direction.
- [naming.md](references/naming.md): operation and namespace names.
- [backend-contracts.md](references/backend-contracts.md): evidence, JSON
  inference, runtime fallback safety, validation, transport, pagination.
- [queries.md](references/queries.md): keys, option factories, hooks,
  authentication.
- [mutations-cache.md](references/mutations-cache.md): mutation effects, cache
  factory, optimistic updates.
- [workflows.md](references/workflows.md): questions, per-mode steps, audit
  checklist.
- [examples/feature-colocated](examples/feature-colocated): read before
  creating a new architecture. A type-checked composition: shared primitives in
  `src/server-state` and a Posts resource with finite and infinite lists,
  detail and related context queries, an authenticated-query factory,
  mutations, and hook-bound cache actions. Copy its reasoning, not its backend
  contract or paths: replace every route, schema, type, auth policy, pagination
  field, default, and cache rule with verified project facts.

## Decision defaults

Use these only when the project has no convention:

- Feature-colocated remote state with direct imports and one hook per operation.
- `detail` as the single-resource read name; `list`, `infiniteList`, `create`,
  `update`, and `delete` for common operations.
- Object inputs for public operations so parameters can grow safely.
- Query option factories own `queryKey` and `queryFn`; thin hooks are the
  component API.
- Named cache operations returned by a pure feature factory that binds
  QueryClient once, plus a thin feature hook for React callers. Do not memoize
  the returned cache API without a measured need.
- `set`, `patch`, `invalidate`, and `remove` for cache actions; reserve
  `delete` for the backend mutation.
- Runtime validation for untrusted serialized data, unless generated backend
  types are the established source of truth.
- The project's existing Axios, fetch, or generated-client transport; for a
  fresh stack, Axios through a project wrapper and TanStack Query. Never add a
  second client.
- No barrel exports in a new structure. Preserve existing public entry points
  during a scoped refactor unless removal is requested.

Do not force `src/features`, Zod, Axios, Query Key Factory, shared response
envelopes, a global `server-state` folder, or the reference example's file
boundaries onto a project that uses a different coherent approach.
