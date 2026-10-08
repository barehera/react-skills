# Framework and runtime boundaries

## Contents

- [Next.js layout](#nextjs-layout)
- [Routes, SSR, and Server Actions](#routes-ssr-and-server-actions)
- [API versus server state](#api-versus-server-state)
- [Providers](#providers)
- [Integrations and internal libraries](#integrations-and-internal-libraries)
- [Environment and localization](#environment-and-localization)

## Next.js layout

The `src/_app` and `src/_pages` names (full tree in the
[Next.js example](../examples/next-app-router/README.md)) avoid a semantic
collision between framework roots and FSD layers. Keep framework-required
files, including middleware and instrumentation when the installed Next.js
version requires it, at the root. For Vite, React Router, or another client
application without reserved route roots, use ordinary `src/app` and
`src/pages`.

## Routes, SSR, and Server Actions

Keep framework route entries thin. They may own route parameters, metadata,
loading/error boundaries, cache/revalidation declarations, and the adapter that
calls or renders a source slice. Business UI and policies belong to the owning
page, widget, feature, or entity.

Next.js route handlers:

- Put app-wide handler composition under `src/_app/api-routes`.
- Put feature-specific action/policy implementation in the feature's `api`
  segment when it changes with that feature.
- Do not build a large backend inside a frontend FSD tree; move a substantial
  service surface to a separate workspace/package.

Server Actions:

- Put the action with the feature or page that owns the user interaction.
- Use a runtime-revealing name such as `create-invitation.server.ts` when the
  framework permits it, and keep `"use server"` or `server-only` at the narrow
  server boundary.
- Call the action from a client adapter or form boundary, never through a
  client-facing aggregate module.

For SSR loaders and prefetching, keep route orchestration in the page/app layer
and reuse feature/entity query option factories or server-safe transport
functions, with no separate client and SSR implementations of one contract.

## API versus server state

| Concern | Owner |
| --- | --- |
| Axios instance, interceptors, cancellation, normalized transport errors | `shared/api` |
| Generated backend client | generated boundary or `shared/api` wrapper |
| Feature endpoint function or Server Action | owner `api` |
| Zod response/request schema | owner `api` or `model`, at the trust boundary |
| TanStack Query key, options, hook, mutation, cache effect | owner `server-state` |
| QueryClient construction and app hydration provider | `_app/providers` or app server-state setup |
| Proven generic query option/auth helpers | focused shared server-state foundation |

Do not create `api` only to mirror functions a generated client or Server
Action already owns.

When several features reuse remote data as a stable business noun, an entity
may own the read/query contract. Mutations that represent a user-valued
interaction stay in the feature and coordinate entity cache effects through
explicit lower-layer APIs.

## Providers

`_app/providers` composes app-wide providers (QueryClient, theme, i18n,
session, error reporting). A provider implementation that is not app-wide stays
beside the subsystem it adapts and is composed in the app provider tree.

## Integrations and internal libraries

`shared/integrations/<vendor>` holds SDK initialization, thin vendor adapters,
consent-aware event dispatch, and runtime-specific setup. Each
`shared/lib/<purpose>` library states its purpose and what does not belong;
never use `libs` as a mixed bucket of vendor code, helpers, and business
policy.

The app layer decides when an integration starts. A feature decides when a
business event occurs and calls a narrow integration API. The integration never
imports the feature.

Firebase splits into `client/`, `server/`, and `config/` direct modules, as in
the example tree. Remote Config defaults are static integration config;
feature-specific flag interpretation stays with the feature or app policy that
owns it.

Analytics consent and initial page tracking are composed in `_app`. Event
names and payload builders that express feature semantics stay beside the
feature unless a typed analytics contract is deliberately shared.

## Environment and localization

Parse environment variables at one typed boundary under `shared/config/env`,
with separate client-safe and server-only access when required. Do not keep a
second `constants` tree for values that environment or feature config already
owns.

i18n initialization, locale negotiation, and genuinely shared messages live in
`shared/i18n`. Feature-specific messages stay with the feature when the i18n
tooling supports colocated namespaces; otherwise keep the project's locale
catalog with keys namespaced by owner.
