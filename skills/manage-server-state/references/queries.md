# Queries

## Cache identity

Use the project's key strategy; Query Key Factory, typed key functions, or
another consistent factory are all valid. Every value that changes the result
appears in a serializable, stable key. Derive discriminating inputs from
documentation, repository evidence, and consumer requirements, because one
observed request may omit supported filters or context that still belong in
the key.

- Finite and infinite variants get distinct keys, because their cached data
  shapes differ.
- Normalize equivalent inputs before building the key.
- Use parent/child context keys only for real ownership in the project's cache
  model, such as related posts under a post detail; otherwise use the child
  resource's own key. Do not nest only to make a key look structured.
- Keep key predicates beside pure key utilities, not in a key declaration file
  when the project separates those responsibilities.

## Option factories and hooks

In a new architecture, option factories own `queryKey`, `queryFn`,
pagination, and shared policy. Add a thin hook per operation when it provides a
stable component API, auth composition, typed overrides, or repeated behavior.
If the project consumes option factories directly and needs nothing
hook-specific, keep that convention instead of adding wrapper hooks.

Typed consumer overrides may control presentation and lifecycle, such as
`enabled`, `select`, placeholder data, and refetch policy. They never replace
cache identity, backend execution, or infinite-pagination rules.

Query options may select
the part components see, such as `response.data`, when that is an intentional
API. Keep infinite pages intact unless a selector explicitly derives a view.

## Authentication

Use the project's real authentication source. Do not mark an endpoint protected
without contract evidence, and do not add a fake auth hook to demonstrate
integration. Reuse an existing authenticated Query wrapper. Otherwise, when
protected queries need shared gating, instantiate the example's
authenticated-query factory once at the integration boundary:

```ts
import { useProjectAuth } from "@/auth/use-project-auth";
import { createAuthenticatedQueryHooks } from "@/server-state/create-authenticated-query-hooks";

function useServerStateAuthentication() {
  const { user } = useProjectAuth();

  return { isAuthenticated: Boolean(user) };
}

export const {
  useAuthenticatedQuery,
  useAuthenticatedInfiniteQuery,
} = createAuthenticatedQueryHooks({
  useAuthentication: useServerStateAuthentication,
});
```

Adapt the import, user signal, and semantics to the project; a loading session
may need a separate readiness condition. Inside an always-protected operation
hook, call `useAuthenticatedQuery` where the hook would call `useQuery`, and
expose only that hook, with no public alias. If no protected endpoint is
verified, leave the factory uninstantiated.

The wrapper combines authentication with the caller's `enabled` and uses
`skipToken` so a logged-out imperative refetch cannot execute the request.
Frontend gating only avoids unnecessary calls; backend authorization remains
required.
