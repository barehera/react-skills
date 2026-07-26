# Adaptive architecture

## Discover before placing files

Record this project profile from repository evidence:

| Decision | Evidence to inspect |
| --- | --- |
| Source root and aliases | `tsconfig`, framework config, existing imports |
| Ownership model | neighboring API/query/mutation files |
| File granularity | feature folders, layer folders, naming conventions |
| Transport | Axios/fetch wrapper, generated SDK, server actions |
| Contract source | User documentation/JSON, API specifications or collections, generated types, backend schemas, existing consumers |
| Auth and errors | existing hooks, interceptors, error classes |
| Query policy | QueryClient defaults, existing key/options factories |

Follow a coherent existing convention unless the user explicitly requests a migration.

## Supported placement patterns

The semantic responsibilities matter; their exact directories do not.

| Project style | Reasonable placement |
| --- | --- |
| Feature-colocated | `src/features/posts/server-state/*` |
| Server-state-rooted | `src/server-state/shared/*`, `src/server-state/posts/*` |
| Domain-oriented | `src/domains/posts/api/*`, `queries/*`, `mutations/*` |
| Layer-oriented | `src/api/posts.ts`, `src/queries/posts/*`, `src/mutations/posts/*` |
| Compact application | `src/server-state/posts/*` or a cohesive `posts.ts` |
| Generated client | Keep generated transport/types untouched; place Query adapters beside the consuming domain |

If the project is new and the user delegates placement, default to feature-colocated code because ownership and deletion boundaries remain clear. If the project intentionally avoids feature or domain folders, use resource-first folders under `src/server-state` instead of scattering each resource across global technical layers. Read [placements.md](placements.md) for the exact mapping and boundaries.

## Semantic responsibilities

Keep these responsibilities identifiable even when several share one file:

- Contract: serialized response/request schemas or trusted generated types.
- Transport: routes and network calls.
- Cache identity: query key construction.
- Query policy: option factories, pagination, selection, staleness.
- Component API: hooks and authentication composition.
- Mutation effects: backend writes and cache synchronization.
- Pure policy: normalization, defaults, predicates, and names when they are genuinely shared.

Start with cohesive files. Split only when a file has multiple independently changing responsibilities or a directory will contain several operations. Do not create empty `constants`, `types`, or `utils` files to satisfy a diagram.

## Dependency direction

Regardless of placement, preserve this direction:

```text
contracts/types/names/defaults
             |
             v
       transport + keys
             |
             v
       query options
             |
             v
           hooks

keys or typed option keys ---> cache actions <--- mutations
```

- Transport must not depend on React hooks.
- Query keys must not depend on option factories.
- Components should normally consume the project's public query/mutation API rather than recreate network policy.
- Cache helpers should build identities through the same key source used by queries.
- A cache helper may use an option factory's typed `queryKey` when it improves cached-data inference. Keep that dependency acyclic: option factories must not import cache helpers.

## Shared versus feature-owned code

Promote code to a shared location only when at least two features need the same project-specific behavior or the project already defines that boundary. Error envelopes, pagination envelopes, auth wrappers, option merging, and transports are not universally reusable merely because they look generic.

Keep third-party SDK setup wherever the project places integrations. Do not relocate it only to match the reference example.
