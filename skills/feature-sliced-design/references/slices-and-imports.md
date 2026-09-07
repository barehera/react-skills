# Feature slices and imports

## Contents

- [Feature test](#feature-test)
- [Slice anatomy](#slice-anatomy)
- [Dependency direction](#dependency-direction)
- [Direct public module paths](#direct-public-module-paths)
- [Cross-slice composition](#cross-slice-composition)
- [Tests and stories](#tests-and-stories)

## Feature test

Create a feature slice for a user-valued interaction that a product stakeholder
would name, especially when it appears on more than one page. Good examples are
`invite-member`, `change-plan`, `save-search`, or `export-report`.

Do not turn every noun, page section, hook, or component into a feature:

- Put `member`, `plan`, or `report` in `entities` when it is a stable business
  concept reused independently.
- Keep a one-page-only block inside that page until reuse or independent
  ownership is proven.
- Put generic inputs, dialogs, layout primitives, and icons in `shared/ui`.
- Put a large composed block such as a reusable workspace header in `widgets`.

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
remain private unless an external consumer has a real, stable use for them.

Prefer `model` for business state, schemas, types, policies, and scoped Zustand
stores. Prefer `ui` for display and UI-only helpers. Prefer `lib` for a focused
internal library used by multiple modules in the same slice. Avoid recreating
global technical buckets inside every feature without need.

## Dependency direction

Use this downward-only graph:

```text
app
 ↓
pages
 ↓
widgets
 ↓
features
 ↓
entities
 ↓
shared
```

A module may import any lower layer and modules inside its own slice. It must
not import a sibling slice on the same layer. Shared imports no business layer.
Entities do not import features. Features do not import pages or widgets.

Inside one slice, use full relative paths:

```ts
import { invitationSchema } from "./model/invitation-schema";
import { InvitationFields } from "./ui/invitation-fields";
```

Across slices, use the source alias and a stable external path:

```ts
import { InviteMemberPanel } from "@/features/invite-member/invite-member-panel";
import type { Member } from "@/entities/member/member";
import { Button } from "@/shared/ui/button/button";
```

Do not reach into another slice's private `model`, `lib`, or implementation-only
modules simply because the alias makes it possible.

## Direct public module paths

Treat public API as an architectural contract, not as a barrel-file shape. New
React Skills structures use these rules:

1. Expose the smallest useful set of stable direct paths.
2. Put real implementation or composition in each public module.
3. Name paths after capabilities, not internal file categories.
4. Keep internal helpers below purpose segments and import them only from the
   owning slice.
5. Forbid `export * from ...` and files whose only job is re-exporting symbols.
6. Allow `index.ts` only when it defines the implementation itself, such as a
   cache factory; do not import that index from another file that it imports.
7. In a package or monorepo, prefer a package `exports` map that lists explicit
   subpaths rather than one catch-all entry.

Document the allowed direct paths in the architecture guide, an ESLint/boundary
configuration, or a package exports map. A convention without enforcement is
easy to erode in a large team.

When migrating a repository that already uses explicit index-based public APIs,
preserve them during scoped work unless removal is authorized. Do not create new
wildcard barrels. Convert existing barrels only after inventorying consumers
and runtime-specific exports.

## Cross-slice composition

Move coordination upward instead of importing sideways:

- Compose two features in a widget or page.
- Put a multi-entity interaction in a feature.
- Pass data or callbacks through props when the higher owner already has them.
- Extract a stable business noun to `entities` only when it is independently
  meaningful.
- Extract a generic foundation to Shared only when it is business-agnostic.

Same-layer grouping folders may improve navigation, but they do not create a
new sharing boundary. `features/billing/change-plan` must not import from
`features/billing/apply-coupon`; compose them above the Features layer.

## Tests and stories

Keep unit tests, component tests, stories, fixtures, and feature-local mocks
beside the module or inside the owning slice. Put cross-feature end-to-end tests
in the repository's established test root because they validate application
composition rather than one slice. Do not create a global fixture or test-utils
dump when the helper serves only one feature.
