# Examples and adaptation

## Complete reference implementation

Read [../examples/feature-colocated](../examples/feature-colocated) when implementing a new architecture or when the task needs a concrete pattern. It contains:

- `src/server-state`: project-wide names, option-override types, parsing/error helpers, transport setup, and authenticated query factory.
- `src/features/posts/server-state`: a complete resource with finite and infinite lists, detail and related context queries, mutations, a QueryClient-bound cache hook, partial cache writes, invalidation, and removal.

This is one tested composition. Do not copy its paths, Axios client, Zod envelopes, authenticated-query policy, Posts fields, pagination, or defaults without verifying they match the target project. The example does not assume Posts writes affect the `related` query; verify that relationship and add a targeted cache effect when the real backend requires one.

Its `parseApiPayload` helper reports schema drift without rejecting the query.
Preserve that non-blocking behavior when adapting it: warn with the normalized
validation details, then return the raw response as the expected output. To
retain additive backend fields in successfully parsed data, adjust the object
schema policy.

## Example: create a feature in an established project

User request:

```text
Add Posts queries and mutations from our generated API client.
```

Expected agent behavior:

1. Inspect the generated client, a neighboring feature, QueryClient setup, and auth.
2. Reuse generated Post types rather than duplicating them in Zod.
3. Follow the existing feature placement even if it differs from the bundled example.
4. Ask only for missing cache/business behavior that cannot be inferred.
5. Add the feature and validate its public imports.

## Example: endpoint with documentation

User request:

```text
Create server state for bookmarks.

GET /api/bookmarks?limit=20
OpenAPI: ./docs/openapi.json
```

Expected agent behavior:

1. Read the supplied OpenAPI operation and any referenced schemas.
2. Inspect the existing frontend transport, auth, QueryClient, and neighboring feature.
3. Ask only for facts missing from both sources, such as mutation cache effects.
4. Do not call the endpoint merely to confirm documentation that is already sufficient.

## Example: endpoint with raw JSON

User request:

```text
Add the bookmarks list query.

GET /api/bookmarks?limit=20

Example 200 response:
{
  "data": [
    {
      "id": "bookmark_1",
      "url": "https://example.com/article",
      "title": "Example article"
    }
  ],
  "meta": {
    "nextCursor": null
  }
}
```

Treat the literal JSON as observed serialized data. Do not convert `id` into a UUID, make `url` a special branded type, or infer optional fields and error shapes that the sample does not prove.

## Example: endpoint without a contract

User request:

```text
Create server state for bookmarks.

GET http://localhost:4000/api/bookmarks?limit=20
```

Expected agent behavior:

1. Inspect the repository for specifications, generated clients, collections, backend schemas, fixtures, and existing consumers.
2. If the contract is still missing, ask for documentation, a redacted cURL/HAR entry, or representative request and response JSON.
3. If the user cannot provide them, observe the request through the local application's normal flow when possible.
4. Send a direct request only after those options fail and only when it satisfies the runtime safety rules.

Do not immediately call the endpoint just because a URL is available.

## Example: undocumented mutation

For an undocumented `POST`, `PATCH`, or `DELETE`, inspect documentation, source, existing application calls, and user-provided payloads. Do not execute it solely to discover its request or response shape. Ask for the contract or observe a user-approved development flow with safe test data.

## Example: adapt placement

Read [placements.md](placements.md) before creating a new structure. If the project avoids feature folders but centralizes remote state, map the same implementation into resource-first modules:

```text
src/server-state/shared/*        project-wide server-state primitives
src/server-state/posts/*         Posts transport, contracts, queries, mutations, and cache
```

Do not create a second copy of the reference implementation merely to change paths. If the project is layer-oriented, preserve its existing `api`, `queries`, and `mutations` layers. If it is small, a single `src/server-state/posts.ts` may remain cohesive until operations or responsibilities grow.

## Example: add a child endpoint

For `GET /posts/:postId/comments`, first inspect the current post key structure. Use a context/nested key only when comments are owned by the post identity in this project's cache model. Otherwise use the established comments resource key. Include every comment filter and page parameter that changes the result.

## Example: protected query

If the project already has an authenticated Query wrapper, reuse it. Otherwise, instantiate `examples/feature-colocated/src/server-state/create-authenticated-query-hooks.ts` once with the real auth hook, then call the resulting authenticated hook inside each protected operation hook. Do not expose both public and authenticated versions of an always-protected operation. Ensure logged-out imperative refetches cannot execute the request.

## Example: refactor without forcing the reference layout

If a project has sound layer-based files but inconsistent `byId`/`detail` aliases, fix the vocabulary and call sites without moving everything into feature folders. Structural consistency is the goal; visual similarity to the bundled example is not.
