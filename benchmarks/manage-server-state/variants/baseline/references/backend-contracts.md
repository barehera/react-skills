# Backend contracts

## Evidence order

Use contract evidence in this order:

1. Use documentation, endpoint descriptions, request examples, raw JSON, cURL, or sanitized HAR data supplied by the user.
2. Inspect the repository for OpenAPI or other API specifications, Postman-style collections, generated clients such as Elysia Eden or other RPC clients, shared server types, runtime schemas, backend route definitions, fixtures, mocks, and existing endpoint consumers.
3. Ask the user for missing documentation or representative request, success, and error payloads.
4. If those sources are insufficient, observe a request that the local application already needs to make through its normal user flow.
5. Send a direct discovery request only as the final fallback and only under the safety rules below.

Do not skip available documentation because a live endpoint is reachable. Runtime samples confirm behavior but rarely describe the full allowed contract.

For every endpoint, resolve:

- HTTP method and exact route
- path, query, header, and body parameters
- success status and response body
- error status and body
- authentication requirement
- nullable versus optional fields and serialized date formats
- list/pagination envelope and next-page rule
- affected cache identities after writes

Do not ask the user for information already present in their evidence or the repository. If several required facts remain missing, ask one compact question requesting the relevant documentation or representative JSON.

## Evidence quality

Classify important contract facts while working:

- `verified`: defined by an executable server schema, generated client, shared backend type, or maintained specification.
- `observed`: present in a real request or response example.
- `inferred`: a conservative interpretation supported by usage but not guaranteed by a contract.
- `unresolved`: unavailable or conflicting evidence that can change the implementation.

When sources disagree, identify the mismatch. Server schemas and generated clients describe allowed shapes; runtime traffic describes current behavior; handwritten documentation may be incomplete or stale. Do not silently select whichever source is easiest to implement.

Documentation typed as `any` or lacking response examples is incomplete evidence. Combine it with existing consumers, fixtures, or user-provided JSON instead of pretending it provides type safety.

## Inferring from JSON

Use representative JSON to model the serialized frontend boundary, not to claim guarantees the sample cannot prove:

- Keep strings as strings unless documentation or project code establishes a date, enum, identifier format, or transformation.
- Do not create an enum from the few values that happened to appear.
- An empty array does not reveal its item shape.
- A `null` value proves that one observed response can be null; it does not establish every field's complete nullability rules.
- A missing field is evidence of optionality only for the same endpoint and response variant.
- Inspect multiple examples when responses vary by role, status, pagination position, or feature flag.
- Keep ambiguous fields `unknown` or request clarification rather than inventing precision.

Prefer schemas that reject missing required data and incompatible types while tolerating additive backend fields according to project policy. With Zod's default object behavior, unknown object keys are omitted instead of breaking parsing.

## Runtime fallback

### Observe before sending

Prefer observing the request produced by the local application over creating a new request. Capture only the target endpoint's method, URL, parameters, body shape, status, response shape, pagination signals, and contract-relevant headers.

- Use browser network inspection, a sanitized HAR, existing application logs, or the project's supported development tooling.
- Keep authentication cookies, tokens, API keys, personal data, and unrelated traffic out of generated code and reports.
- Do not treat one successful response as proof of error behavior, optionality, or mutation cache effects.
- If the available AI tool cannot inspect network traffic, ask the user for documentation, raw JSON, a sanitized HAR entry, or a redacted cURL example.

### Send only as the final fallback

Send a discovery request only after user evidence, repository evidence, another user request for payload examples, and passive observation are insufficient.

- Limit default probing to a verified local or development environment.
- Verify the method, target, required parameters, and authentication approach before sending.
- Reuse the project's established transport or an existing authenticated development session without exposing credentials.
- Prefer verified read-only endpoints. Do not execute create, update, delete, upload, payment, or other state-changing operations solely to discover their contract.
- Never probe production, trigger deliberate error cases, or submit guessed payloads without explicit user authorization.
- Record that the result is observed evidence rather than a complete contract.

## Contract strategy

Choose the strategy already used by the project:

- Runtime schemas: parse untrusted HTTP and persisted external data; infer TypeScript types when practical.
- Generated client/types: preserve them as the source of truth and do not duplicate every model in Zod without a stated runtime-validation requirement.
- Handwritten TypeScript only: preserve it for a scoped endpoint, but identify that runtime response validation is absent when it matters.

Do not invent a universal `{ data }`, pagination, or error envelope. Shared builders are project-specific and must match the actual backend.

### Non-blocking schema drift

Treat response parsing as validation plus schema-drift reporting, not a reason
to fail an otherwise successful request. If parsing fails, create the normalized
invalid-response error for diagnostics, warn with its issues, and return the raw
payload as the expected output. This intentionally favors application
continuity over a strict runtime guarantee.

Keep schemas tolerant of changes the application can safely ignore. Zod objects
ignore additive unknown keys by default. Choose `.passthrough()` only when
consumers must retain those keys.

## Transport operations

- Reuse the existing Axios, fetch, GraphQL, RPC, server-action, or generated-client abstraction.
- Treat network responses as untrusted when runtime parsing establishes the type. With Axios this commonly means `<unknown>` before parsing.
- When runtime parsing fails, warn with the normalized invalid-response details and preserve the raw backend payload so the query remains successful.
- Let parsing infer the return type instead of restating a redundant Promise type.
- Return the validated backend shape unchanged unless the project intentionally maps distinct models.
- Encode dynamic URL segments and forward cancellation through `AbortSignal` when the transport supports it.
- Normalize filters only to produce a stable request/key representation, apply centralized policy, or meet backend constraints.
- Execute request schemas that contain refinements or transforms at the chosen validation boundary; do not infer types from rules the application never runs.
- Let the transport set `Content-Type` for requests with bodies unless the backend requires a project-wide override. Forcing it onto bodyless cross-origin requests can cause unnecessary preflights.

## Pagination

Keep pagination backend-shaped. Parse the actual page envelope, type the actual page parameter, keep `initialPageParam` and `getNextPageParam` with the infinite-query policy, and return pages unchanged. Never convert every backend to a fictional generic cursor model.

For streaming endpoints, use the project's established client or a maintained protocol library instead of creating a custom response parser inside the feature example.
