# Backend contracts

## Intake

Resolve these from code, generated clients, API documentation, fixtures, or the user:

- HTTP method and exact route
- path, query, header, and body parameters
- success status and response body
- error status and body
- authentication requirement
- nullable versus optional fields and serialized date formats
- list/pagination envelope and next-page rule
- affected cache identities after writes

Do not ask the user for information already present in the repository. If several required facts are missing, ask one compact contract question and provide a fill-in shape.

## Contract strategy

Choose the strategy already used by the project:

- Runtime schemas: parse untrusted HTTP and persisted external data; infer TypeScript types when practical.
- Generated client/types: preserve them as the source of truth and do not duplicate every model in Zod without a stated runtime-validation requirement.
- Handwritten TypeScript only: preserve it for a scoped endpoint, but identify that runtime response validation is absent when it matters.

With Zod's default object behavior, additive unknown object keys do not fail parsing and are omitted from the parsed value. Missing required fields and incompatible types should fail with the project's normalized invalid-response error.

Do not invent a universal `{ data }`, pagination, or error envelope. Shared builders are project-specific and must match the actual backend.

## Transport operations

- Reuse the existing Axios, fetch, GraphQL, RPC, server-action, or generated-client abstraction.
- Treat network responses as untrusted when runtime parsing establishes the type. With Axios this commonly means `<unknown>` before parsing.
- Let parsing infer the return type instead of restating a redundant Promise type.
- Return the validated backend shape unchanged unless the project intentionally maps distinct models.
- Encode dynamic URL segments and forward cancellation through `AbortSignal` when the transport supports it.
- Normalize filters only to produce a stable request/key representation, apply centralized policy, or meet backend constraints.
- Execute request schemas that contain refinements or transforms at the chosen validation boundary; do not infer types from rules the application never runs.
- Let the transport set `Content-Type` for requests with bodies unless the backend requires a project-wide override. Forcing it onto bodyless cross-origin requests can cause unnecessary preflights.

## Pagination

Keep pagination backend-shaped. Parse the actual page envelope, type the actual page parameter, keep `initialPageParam` and `getNextPageParam` with the infinite-query policy, and return pages unchanged. Never convert every backend to a fictional generic cursor model.

For streaming endpoints, use the project's established client or a maintained protocol library instead of creating a custom response parser inside the feature example.
