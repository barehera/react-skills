# Placement patterns

Choose placement from repository ownership, not personal preference. Preserve a coherent existing structure. Use these patterns only when the project has no established answer or the user requests a migration.

## Feature-colocated

Use when the application owns code through feature or domain folders:

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

The bundled TypeScript implementation uses this placement.

## Server-state-rooted

Use when the project does not organize application code by feature but wants all remote-state ownership under one boundary:

```text
src/
└── server-state/
    ├── shared/
    │   ├── api.ts
    │   ├── constants.ts
    │   ├── create-authenticated-query-hooks.ts
    │   ├── names.ts
    │   ├── schemas.ts
    │   ├── types.ts
    │   └── utils.ts
    ├── posts/
    │   ├── api.ts
    │   ├── cache/
    │   │   ├── index.ts
    │   │   └── use-cache.ts
    │   ├── constants.ts
    │   ├── names.ts
    │   ├── schemas.ts
    │   ├── types.ts
    │   ├── utils.ts
    │   ├── queries/
    │   │   ├── keys.ts
    │   │   ├── options.ts
    │   │   └── use-*-query.ts
    │   └── mutations/
    │       └── use-*-mutation.ts
    └── users/
        └── ...
```

Keep each resource cohesive. Do not replace `posts` and `users` with global `api`, `queries`, `mutations`, `schemas`, and `types` directories that scatter one resource across the project.

Map the canonical example by responsibility:

| Canonical path | Server-state-rooted path |
| --- | --- |
| `src/server-state/*` | `src/server-state/shared/*` |
| `src/features/posts/server-state/*` | `src/server-state/posts/*` |

Use direct imports:

```ts
import type { QueryHookInput } from "@/server-state/shared/types";
import { mergeQueryOptions } from "@/server-state/shared/utils";

import { postsQueries } from "@/server-state/posts/queries/options";
```

Do not add barrel files merely to shorten these paths.

## Shared boundary

Place code in `shared` only when it is project-wide or used by multiple resources: transport configuration, canonical operation names, query-hook types, authenticated-query composition, or generic option merging.

Keep resource routes, filters, schemas, types, defaults, normalization, and cache behavior inside the resource folder. `shared` must never import a resource. A resource may import `shared`, but avoid resource-to-resource imports unless the existing architecture defines that ownership.

If the project already keeps shared server-state files directly at `src/server-state`, preserve that convention instead of introducing `shared` solely to match this example.

## Compact and layer-oriented projects

For a small application, `src/server-state/posts.ts` may remain cohesive until responsibilities or operations justify splitting.

For an established layer-oriented project, preserve its `api`, `queries`, and `mutations` layers. Do not move it into either pattern only for visual consistency.
