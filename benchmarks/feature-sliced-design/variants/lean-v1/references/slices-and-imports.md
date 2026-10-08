# Feature slices and imports

## Contents

- [Feature test](#feature-test)
- [Slice anatomy](#slice-anatomy)
- [Import paths](#import-paths)
- [Direct public module paths](#direct-public-module-paths)
- [Cross-slice composition](#cross-slice-composition)
- [Tests and stories](#tests-and-stories)

## Feature test

Create a feature slice for a user-valued interaction a product stakeholder
would name, especially one that appears on more than one page, such as
`invite-member`, `change-plan`, `save-search`, or `export-report`.

Do not turn every noun, page section, hook, or component into a feature:

- Put `member`, `plan`, or `report` in `entities` when it is a stable business
  concept reused independently.
- Keep a one-page-only block inside that page until reuse or independent
  ownership is proven.
- Put generic inputs, dialogs, layout primitives, and icons in `shared/ui`.

Use business language. Avoid feature names such as `common`, `core`, `helpers`,
`data`, or `components`.

## Slice anatomy

Create only required segments:

```text
features/
└── invite-member/
    ├── invite-member-panel.tsx     # real stable external entry module
    ├── api/
    │   └── create-invitation.ts
    ├── model/
    │   ├── invitation-schema.ts
    │   └── invitation-policy.ts
    ├── server-state/
    │   └── use-create-invitation-mutation.ts
    ├── ui/
    │   └── invitation-fields.tsx
    └── config/
        └── invitation-limits.ts
```

The root entry module contains the public composition or implementation; it is
not a file that only re-exports `ui/invitation-fields.tsx`. Supporting modules
stay private unless an external consumer has a real, stable use for them.

`model` holds business state, schemas, types, policies, and scoped Zustand
stores; `ui` holds display and UI-only helpers; `lib` holds a focused internal
library used by several modules in the same slice. Do not recreate global
technical buckets inside every feature.

## Import paths

Inside one slice, use full relative paths:

```ts
import { invitationSchema } from "./model/invitation-schema";
import { InvitationFields } from "./ui/invitation-fields";
```

Across slices, use the source alias and a stable external path:

```ts
import { InviteMemberPanel } from "@/features/invite-member/invite-member-panel";
import type { Member } from "@/entities/member/member";
import { Button } from "@/shared/ui/button";
```

Do not reach into another slice's private `model`, `lib`, or implementation-only
modules simply because the alias makes it possible.

## Direct public module paths

1. Expose the smallest useful set of stable direct paths, named after
   capabilities, not internal file categories.
2. Keep internal helpers below purpose segments, imported only by the owning
   slice.
3. An implementation `index.ts`, such as a cache factory, is never imported by
   a file it imports.
4. In a package or monorepo, prefer an `exports` map that lists explicit
   subpaths over one catch-all entry.

Document the allowed paths in the architecture guide, an ESLint/boundary
configuration, or a package exports map, because an unenforced convention
erodes in a large team.

When a repository already uses explicit index-based public APIs, preserve them
during scoped work unless removal is authorized, and create no new wildcard
barrels. Convert existing barrels only after inventorying consumers and
runtime-specific exports.

## Cross-slice composition

Move coordination upward instead of importing sideways:

- Compose two features in a widget or page.
- Put a multi-entity interaction in a feature.
- Pass data or callbacks through props when the higher owner already has them.
- Extract a stable business noun to `entities` only when it is independently
  meaningful.

Same-layer grouping folders aid navigation but create no sharing boundary:
`features/billing/change-plan` must not import from
`features/billing/apply-coupon`; compose them above the Features layer.

## Tests and stories

Keep unit tests, component tests, stories, fixtures, and feature-local mocks
beside the module or inside the owning slice. Cross-feature end-to-end tests go
in the repository's established test root, because they validate application
composition. Do not create a global fixture or test-utils dump for a helper
that serves one feature.
