# Backend contracts

## Contents

- [Evidence order](#evidence-order)
- [Evidence quality](#evidence-quality)
- [Inferring from JSON](#inferring-from-json)
- [Runtime fallback](#runtime-fallback)
- [Contract strategy](#contract-strategy)
- [Transport operations](#transport-operations)
- [Pagination](#pagination)

## Evidence order

1. Documentation, endpoint descriptions, request examples, raw JSON, cURL, or
   sanitized HAR data supplied by the user.
2. Repository evidence: OpenAPI or other specifications, Postman-style
   collections, generated clients such as Elysia Eden or other RPC clients,
   shared server types, runtime schemas, backend route definitions, fixtures,
   mocks, and existing endpoint consumers.
3. A request to the user for missing documentation or representative request,
   success, and error payloads, asked once and compactly. Do not ask for what
   the evidence or repository already contains.
4. Observation of a request the local application already makes through its
   normal user flow.
5. A direct discovery request, only under the [safety rules](#runtime-fallback).

Do not skip available documentation because a live endpoint is reachable, and
do not call an endpoint only because a URL was given: runtime samples confirm
behavior but rarely describe the full allowed contract.

Resolve for every endpoint: method and exact route; path, query, header, and
body parameters; success status and body; error status and body;
authentication; nullable versus optional fields and serialized date formats;
the list envelope and next-page rule; and the cache identities a write
affects. Implement once these are established well enough. A weakly typed
backend does not block a useful frontend boundary: build the narrowest honest
contract the evidence supports and report what remains uncertain.

## Evidence quality

Classify important contract facts:

- `verified`: defined by an executable server schema, generated client, shared
  backend type, or maintained specification.
- `observed`: present in a real request or response example.
- `inferred`: a conservative interpretation supported by usage but not
  guaranteed by a contract.
- `unresolved`: unavailable or conflicting evidence that can change the
  implementation.

When sources disagree, report the mismatch instead of choosing whichever is
easiest: server schemas and generated clients describe allowed shapes, runtime
traffic describes current behavior, and handwritten documentation may be stale.
Documentation typed as `any` or lacking response examples is incomplete; combine
it with consumers, fixtures, or user-provided JSON.

## Inferring from JSON

JSON samples model the serialized frontend boundary; they cannot prove
guarantees:

- Keep strings as strings unless documentation or project code establishes a
  date, enum, identifier format, or transformation.
- Do not create an enum from the few values that appeared.
- An empty array does not reveal its item shape.
- A `null` value proves only that one observed response can be null.
- A missing field is evidence of optionality only for the same endpoint and
  response variant.
- Inspect several examples when responses vary by role, status, page position,
  or feature flag.
- Keep ambiguous fields `unknown` or ask, rather than inventing precision.

Prefer schemas that reject missing required data and incompatible types while
tolerating additive backend fields according to project policy. Zod objects omit unknown keys by default; use
`.passthrough()` only when consumers must retain them.

## Runtime fallback

Observe before sending. Prefer the request the local application already
produces, through browser network inspection, a sanitized HAR, application
logs, or the project's development tooling. Capture only the target endpoint's
method, URL, parameters, body shape, status, response shape, pagination
signals, and contract-relevant headers. Keep cookies, tokens, API keys,
personal data, and unrelated traffic out of code and reports.

Send a discovery request only after every earlier source is insufficient:

- Limit default probing to a verified local or development environment.
- Verify the method, target, parameters, and auth approach first, and reuse
  the project's transport or an existing development session without exposing
  credentials.
- Prefer verified read-only endpoints. Never execute create, update, delete,
  upload, payment, or other state-changing operations solely to discover their
  contract or cache effects.
- Never probe production, trigger deliberate error cases, or submit guessed
  payloads without explicit user authorization.

One successful response is observed evidence, not proof of error behavior,
optionality, or mutation cache effects.

## Contract strategy

Follow the strategy the project already uses:

- Runtime schemas: parse untrusted HTTP and persisted external data; infer
  TypeScript types when practical.
- Generated client/types: keep them as the source of truth; do not duplicate
  every model in Zod without a stated runtime-validation requirement.
- Handwritten TypeScript only: keep it for a scoped endpoint, and say that
  runtime response validation is absent when it matters.

Do not invent a universal `{ data }`, pagination, or error envelope; shared
builders must match the actual backend.

When a response fails parsing, `parseApiPayload` in the example creates the
normalized invalid-response error for diagnostics, warns with its issues, and
returns the raw payload, deliberately favoring application continuity over a
strict runtime guarantee.

## Transport operations

- Reuse the existing Axios, fetch, GraphQL, RPC, server-action, or
  generated-client abstraction.
- Treat responses as untrusted when runtime parsing establishes the type; with
  Axios, request `<unknown>` and let parsing infer the return type.
- Return the validated backend shape unchanged unless the project
  intentionally maps distinct models.
- Encode dynamic URL segments and forward `AbortSignal` when the transport
  supports it.
- Normalize filters only to produce a stable request/key representation, apply
  centralized policy, or meet backend constraints.
- Execute request schemas that contain refinements or transforms at the chosen
  validation boundary; do not infer types from rules the application never runs.
- Let the transport set `Content-Type` unless the backend requires a
  project-wide override; forcing it onto bodyless cross-origin requests causes
  needless preflights.

## Pagination

Keep pagination backend-shaped: parse the actual page envelope, type the actual
page parameter, keep `initialPageParam` and `getNextPageParam` in the
infinite-query policy, and return pages unchanged. Never convert every backend
to a fictional generic cursor model. For streaming endpoints, use the project's
client or a maintained protocol library instead of a custom parser.
