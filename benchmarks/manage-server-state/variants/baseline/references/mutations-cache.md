# Mutations and cache

## Mutation ownership

Follow the project's public API style. A mutation hook normally owns `useMutation`, calls the transport operation, obtains a feature cache API, and applies the endpoint's actual cache effects. Separate reusable cache actions when more than one mutation or workflow needs them; keep a simple one-off update local when extraction adds no clarity.

Bind QueryClient once in a pure cache factory. Define named operations, then return the public cache API:

```ts
export function createPostsCache(queryClient: QueryClient) {
  function setDetail({ post }: PostCacheSetDetailInput) {
    queryClient.setQueryData(
      postsQueries.detail({ postId: post.id }).queryKey,
      post,
    );
  }

  function invalidateLists() {
    return queryClient.invalidateQueries({
      queryKey: postsQueryKeys.list._def,
    });
  }

  return {
    setDetail,
    invalidateLists,
  } as const;
}

export function usePostsCache() {
  return createPostsCache(useQueryClient());
}
```

Consumers call `usePostsCache()` once and invoke operations with domain inputs only. Do not include QueryClient in every cache action input.

Keep the factory in `cache/index.ts` and the React adapter in `cache/use-cache.ts`. The index file contains the implementation; it is not a barrel. Do not add `useMemo` or `useCallback` without a measured referential-stability need.

Keep cache invariants and shared side effects inside the cache operations. For component-specific reactions, use the mutation call's supported callbacks, such as `mutate(input, { onSuccess, onError })`. Do not add generic hook arguments that merely forward mutation options.

Use the backend result and mutation variables. Do not broadly invalidate every resource by habit.

Do not execute a mutation solely to discover its contract or cache effects. Use documentation, backend/source evidence, existing application behavior, and user-confirmed business rules.

## Cache semantics

- `set`: write a complete value when the response is sufficient.
- `patch`: merge partial data into an existing value; do not seed an invalid entity.
- `invalidate`: mark affected queries stale and optionally refetch according to Query policy.
- `remove`: erase cache entries after deletion or loss of access.
- `delete`: reserve for the network mutation.

Build cache identities through the same key source as reads. Account for finite, infinite, filtered, detail, and context caches as different shapes.

Prefer an option factory's typed `queryKey` for cache reads and writes when it preserves cached-data inference without a cycle. Raw key factories remain useful for prefix invalidation and removal.

TanStack Query filters prefix-match by default. Choose `exact` deliberately and define consistently whether detail removal includes owned context queries.

## Choosing mutation effects

Derive effects from the contract and UX:

- Create: seed detail only if a complete entity is returned; invalidate or patch relevant collections.
- Update: set detail from a complete response or patch known fields; refresh collections whose sorting/filter membership may change.
- Delete: remove detail and update/invalidate collections and dependent contexts.
- Relationship mutation: update/invalidate the relationship context and any count displayed elsewhere.

Ask when business behavior is unknowable, such as whether an update changes list membership or whether the backend returns a complete entity.

## Optimistic updates

Use optimistic state only when the interaction benefits and rollback is well-defined:

1. Cancel the exact affected queries.
2. Snapshot every shape that will change.
3. Apply the smallest optimistic change.
4. Restore snapshots on error, including valid empty/falsy data.
5. Reconcile with the server result or targeted invalidation.

Do not copy one optimistic recipe across detail, filtered list, and infinite pages.

Prefer existing project-wide error reporting. Do not introduce a toast, logging, or translation dependency inside reusable server-state code without a project requirement.
