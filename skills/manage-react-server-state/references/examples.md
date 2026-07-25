# Examples and adaptation

## Complete reference implementation

Read [../examples/feature-colocated](../examples/feature-colocated) when implementing a new architecture or when the task needs a concrete pattern. It contains:

- `src/server-state`: project-wide names, option-override types, parsing/error helpers, transport setup, and authenticated query factory.
- `src/features/posts/server-state`: a complete resource with finite and infinite lists, detail and related context queries, mutations, partial cache writes, invalidation, and removal.

This is one tested composition. Do not copy its paths, Axios client, Zod envelopes, auth import, Posts fields, pagination, or defaults without verifying they match the target project.

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

## Example: missing backend information

User request:

```text
Create server state for bookmarks.
```

If no backend contract exists in the repository, ask one combined question:

```text
Please provide the bookmark endpoints (method + route), request fields,
successful response examples, error shape, authentication requirement, and
pagination rule if lists are paginated. I can then derive the schemas/types and
cache behavior without guessing your backend.
```

Do not ask about values already present in API documentation or generated code.

## Example: adapt placement

If the project is layer-oriented, map the same responsibilities instead of creating `features/<feature>/server-state`:

```text
src/api/posts.ts                 transport and contracts if colocated
src/query-keys/posts.ts          cache identity
src/queries/posts/options.ts     read policy
src/queries/posts/use-post.ts    component API
src/mutations/posts/use-update-post.ts
```

If the project is small, a single `src/server-state/posts.ts` may remain cohesive. Split it only when operations or responsibilities grow.

## Example: add a child endpoint

For `GET /posts/:postId/comments`, first inspect the current post key structure. Use a context/nested key only when comments are owned by the post identity in this project's cache model. Otherwise use the established comments resource key. Include every comment filter and page parameter that changes the result.

## Example: protected query

If the project already has an authenticated Query wrapper, reuse it. Otherwise, instantiate `examples/feature-colocated/src/server-state/create-authenticated-query-hooks.ts` once with the real auth hook, then call the resulting authenticated hook inside each protected operation hook. Do not expose both public and authenticated versions of an always-protected operation. Ensure logged-out imperative refetches cannot execute the request.

## Example: refactor without forcing the reference layout

If a project has sound layer-based files but inconsistent `byId`/`detail` aliases, fix the vocabulary and call sites without moving everything into feature folders. Structural consistency is the goal; visual similarity to the bundled example is not.
