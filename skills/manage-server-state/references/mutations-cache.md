# Mutations and cache

## Mutation ownership

Follow the project's public API style. A mutation hook normally owns
`useMutation`, calls the transport operation, obtains the feature cache API,
and applies the endpoint's actual cache effects. Extract cache actions when
more than one mutation or workflow needs them; keep a one-off update local
when extraction adds no clarity.

The cache factory binds QueryClient once. In the example,
`createPostsCache(queryClient)` in `cache/index.ts` defines named operations and
returns them (the file holds the implementation; it is not a barrel), and
`usePostsCache()` in `cache/use-cache.ts` returns
`createPostsCache(useQueryClient())`. Consumers call `usePostsCache()` once and
pass domain inputs only, never QueryClient. Do not add `useMemo` or
`useCallback` without a measured referential-stability need.

Cache invariants and shared side effects live in the cache operations.
Component-specific reactions use the mutation call's callbacks, such as
`mutate(input, { onSuccess, onError })`; do not add generic hook arguments that
only forward mutation options.

Prefer existing project-wide error reporting. Do not add a toast, logging, or
translation dependency inside reusable server-state code without a project
requirement.

## Cache semantics

- `set` (`setDetail`): write a complete value when the response is sufficient.
- `patch` (`patchDetail`): merge partial data into an existing value; never
  seed an invalid entity.
- `invalidate` (`invalidateLists`): mark affected queries stale; refetch
  follows Query policy.
- `remove` (`removeDetail`): erase entries after deletion or loss of access.
- `delete`: reserved for the network mutation.

Build cache identities through the same key source as reads, and treat finite,
infinite, filtered, detail, and context caches as different shapes. Prefer an
option factory's typed `queryKey` for reads and writes when it preserves
cached-data inference without a cycle; raw key factories suit prefix
invalidation and removal. TanStack Query filters prefix-match by default, so
choose `exact` deliberately and decide consistently whether detail removal
includes owned context queries.

## Choosing mutation effects

Derive effects from the backend result, the mutation variables, the contract,
and the UX, not by invalidating every resource by habit:

- Create: seed detail only if a complete entity is returned; invalidate or
  patch relevant collections.
- Update: set detail from a complete response or patch known fields; refresh
  collections whose sorting or filter membership may change.
- Delete: remove detail and update or invalidate collections and dependent
  contexts.
- Relationship mutation: update or invalidate the relationship context and any
  count displayed elsewhere.

Ask when business behavior is unknowable, such as whether an update changes
list membership or whether the backend returns a complete entity. The example's
Posts writes leave the `related` query alone; verify such relationships in the
real backend and add a targeted effect when it requires one.

## Optimistic updates

Use optimistic state only when the interaction benefits and rollback is
well-defined:

1. Cancel the exact affected queries.
2. Snapshot every shape that will change.
3. Apply the smallest optimistic change.
4. Restore snapshots on error, including valid empty or falsy data.
5. Reconcile with the server result or targeted invalidation.

Do not copy one optimistic recipe across detail, filtered list, and infinite
pages.
