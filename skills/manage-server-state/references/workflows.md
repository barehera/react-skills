# Workflows and questions

## Question policy

Inspect first. Ask only when an unresolved answer changes routes, types, placement, dependencies, authentication, pagination, cache behavior, or public compatibility.

Useful compact questions include:

- Contract evidence: “Please share the endpoint documentation, OpenAPI or collection file, redacted cURL, or representative request and response JSON. Which of these is available?”
- Pagination: “Is this cursor, offset, or page based, and which response value indicates the next request?”
- Authentication: “Is this endpoint public or protected, and which existing auth hook/client should gate it?”
- Cache: “Does the mutation return the complete entity, and which visible collections or relationships can it change?”
- New architecture: “I found no existing server-state convention. May I use feature-colocated files and the current transport, or do you prefer a layer-based layout?”
- Dependency: “The project has no runtime validation/key factory. Should I add the proposed dependency or implement with existing tools?”

Do not ask users to choose between implementation details they delegated. Recommend one option with a reason and proceed when the choice is reversible and within scope.

## Discover an endpoint contract

1. Read the method, route, documentation, descriptions, raw JSON, and request examples supplied by the user.
2. Inspect the repository for specifications, collections, generated clients, backend schemas, route handlers, fixtures, existing consumers, and neighboring features.
3. Record which contract facts are verified, observed, inferred, or unresolved.
4. Ask one compact question for missing documentation or representative request, success, and error JSON.
5. If the user cannot provide more evidence, observe the request through the local application's normal flow when tooling permits.
6. Send a direct request only as the final fallback under the safety rules in [backend-contracts.md](backend-contracts.md).
7. Implement only after the route, inputs, response shape, authentication, pagination, and relevant cache behavior are sufficiently established.

Do not block a useful frontend boundary merely because the backend is weakly typed. Build the narrowest honest frontend contract supported by the available evidence, validate untrusted responses when appropriate, and report remaining uncertainty.

## Endpoint supplied without documentation

If the user provides only a method and URL:

1. Inspect the repository before asking for information it already contains.
2. Request API documentation, raw request/response JSON, or a redacted cURL/HAR example.
3. Do not immediately call the endpoint.
4. Use passive local traffic observation only after the documentation path is exhausted.
5. Use a direct request last and never execute a mutation solely for discovery.

## Create from scratch

1. Inspect framework, source roots, aliases, transport, QueryClient, auth, contract sources, and repository instructions.
2. Propose the smallest structure that can support the first real feature. Avoid speculative shared abstractions.
3. Confirm only missing material decisions, especially contract source and allowed dependencies.
4. Establish naming and key rules, then implement the first vertical slice end to end.
5. Extract shared primitives only after they are actually shared or clearly project-wide.

## Create feature

1. Inspect one neighboring feature if available.
2. Confirm singular/plural names and all endpoint contracts in scope.
3. Choose placement by project convention.
4. Implement contracts/types, transport, keys/options, hooks, mutations, and cache effects in dependency order.
5. Create only files with real responsibilities.

## Add endpoint

1. Preserve the feature's existing vocabulary and placement.
2. Determine whether the operation is a root read, a child/context read, or a write.
3. Extend the smallest set of contract, transport, key, option, hook, and cache files.
4. Avoid unrelated migrations and keep existing public imports stable.

## Refactor

1. Inventory public imports and call sites before changing structure.
2. Identify concrete problems: duplicated keys, inconsistent naming, unsafe responses, auth leaks, cache bugs, or mixed responsibilities.
3. Agree on migration scope when public APIs or many files will change.
4. Migrate in dependency order and update consumers before removing old entry points.
5. Preserve backend behavior unless a contract change is independently verified.

## Audit

Report evidence with file and line locations. Do not implement fixes unless authorized. Check:

- Placement follows the project or has an explicit rationale.
- One vocabulary is used for each operation.
- Backend routes, request fields, and response handling match evidence.
- Contract facts distinguish verified, observed, inferred, and unresolved evidence.
- Runtime requests were not used when documentation or repository evidence was sufficient.
- Runtime validation or generated-type trust is deliberate.
- Query keys include every discriminating input.
- Finite and infinite data shapes do not share an identity.
- Cancellation and auth gating prevent unintended requests.
- Hooks/options expose a stable API without allowing identity replacement.
- Pagination remains backend-shaped.
- Mutation cache effects are targeted and complete.
- Defaults are centralized only where repetition exists.
- Public imports remain compatible within the requested scope.
- Available validation commands pass.

## Completion report

State the selected layout, naming and contract evidence, evidence quality, dependencies added, assumptions made, cache policy, validation performed, runtime inspection performed if any, and any questions still blocking full correctness.
