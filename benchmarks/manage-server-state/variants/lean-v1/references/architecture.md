# Architecture and placement

## Contents

- [Project profile](#project-profile)
- [Placement](#placement)
- [Shared versus resource code](#shared-versus-resource-code)
- [Responsibilities](#responsibilities)
- [Dependency direction](#dependency-direction)

## Project profile

Record from repository evidence before placing files:

| Decision | Evidence to inspect |
| --- | --- |
| Source root and aliases | `tsconfig`, framework config, existing imports |
| Ownership and file granularity | neighboring API/query/mutation files, feature or layer folders, naming |
| Transport | Axios/fetch wrapper, generated SDK, server actions |
| Contract source | user documentation/JSON, API specifications or collections, generated types, backend schemas, existing consumers |
| Auth and errors | existing hooks, interceptors, error classes |
| Query policy | QueryClient defaults, existing key/options factories |
| Validation commands | package scripts |

Follow a coherent existing convention unless the user explicitly requests a
migration.

## Placement

Responsibilities matter; their exact directories do not.

| Project style | Placement |
| --- | --- |
| Feature-colocated | `src/server-state/*`, `src/features/posts/server-state/*` |
| Server-state-rooted | `src/server-state/shared/*`, `src/server-state/posts/*` |
| Domain-oriented | `src/domains/posts/api/*`, `queries/*`, `mutations/*` |
| Layer-oriented | `src/api/posts.ts`, `src/queries/posts/*`, `src/mutations/posts/*` |
| Compact application | `src/server-state/posts/*` or one cohesive `posts.ts` |
| Generated client | generated transport/types untouched; Query adapters beside the consuming domain |

When the project is new and the user delegates placement, use
feature-colocated code, because ownership and deletion boundaries stay clear.
The bundled example uses it:

```text
src/
├── server-state/
│   ├── api.ts
│   ├── names.ts
│   ├── types.ts
│   └── utils.ts
└── features/
    └── posts/
        └── server-state/
            ├── api.ts
            ├── cache/
            │   ├── index.ts
            │   └── use-cache.ts
            ├── schemas.ts
            ├── types.ts
            ├── queries/
            └── mutations/
```

If the project intentionally avoids feature folders, keep each resource
cohesive under `src/server-state`: `src/server-state/*` maps to
`src/server-state/shared/*` and `src/features/posts/server-state/*` to
`src/server-state/posts/*`. Do not scatter one resource across global `api`,
`queries`, `mutations`, `schemas`, and `types` directories. Import directly
(`@/server-state/posts/queries/options`); do not add barrels to shorten paths.

Preserve an established layer-oriented project's `api`, `queries`, and
`mutations` layers. A small application may keep one cohesive
`src/server-state/posts.ts` until operations justify splitting. Do not
duplicate the reference implementation only to change directories.

## Shared versus resource code

Promote code to the shared location only when it is project-wide or at least
two resources need the same project-specific behavior: transport
configuration, canonical operation names, query-hook types,
authenticated-query composition, or generic option merging. Error envelopes,
pagination envelopes, auth wrappers, and transports are not reusable merely
because they look generic.

Resource routes, filters, schemas, types, defaults, normalization, and cache
behavior stay in the resource folder. Shared code never imports a resource;
avoid resource-to-resource imports unless the architecture defines that
ownership. If the project keeps shared files directly at `src/server-state`,
do not introduce `shared` to match the example. Keep third-party SDK setup
where the project places integrations.

## Responsibilities

Keep these identifiable even when several share one file: contract (schemas
or trusted generated types), transport (routes and calls), cache identity
(keys), query policy (option factories, pagination, selection, staleness),
component API (hooks and auth composition), mutation effects, and pure policy
(normalization, defaults, predicates, names) when genuinely shared.

Start with cohesive files. Split only when a file has independently changing
responsibilities or a directory will hold several operations. Do not create
empty `constants`, `types`, or `utils` files to satisfy a diagram.

## Dependency direction

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

keys or typed option keys ---> cache factory ---> cache hook ---> mutations
```

- Transport does not depend on React hooks, and query keys do not depend on
  option factories.
- Components consume the project's public query/mutation API instead of
  recreating network policy.
- Cache helpers build identities through the same key source as queries. They
  may use an option factory's typed `queryKey` for cached-data inference;
  option factories never import cache helpers.
