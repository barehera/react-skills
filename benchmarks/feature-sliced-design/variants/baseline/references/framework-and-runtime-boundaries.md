# Framework and runtime boundaries

## Contents

- [Next.js layout](#nextjs-layout)
- [Routes, SSR, and Server Actions](#routes-ssr-and-server-actions)
- [API versus server state](#api-versus-server-state)
- [Providers and stores](#providers-and-stores)
- [Integrations and internal libraries](#integrations-and-internal-libraries)
- [Firebase example](#firebase-example)
- [Environment, assets, and localization](#environment-assets-and-localization)

## Next.js layout

Follow the official [FSD Next.js guide](https://feature-sliced.design/docs/guides/tech/with-nextjs)
when `app` or `pages` is framework-owned. Prefer:

```text
project/
├── app/                         # Next.js App Router only
├── public/                      # static URL-served files
├── scripts/                     # repository automation
└── src/
    ├── _app/                    # FSD app layer
    ├── _pages/                  # FSD pages layer
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

The underscore avoids a semantic collision between framework roots and FSD
layers. Keep framework-required files at the root, including middleware and
instrumentation when the installed Next.js version requires it.

For Vite, React Router, or another client application without reserved route
roots, use ordinary `src/app` and `src/pages` names.

## Routes, SSR, and Server Actions

Keep framework route entries thin. They may own route parameters, metadata,
loading/error boundaries, cache/revalidation declarations, and the adapter that
calls or renders a source slice. Put business UI and policies in the owning
page, widget, feature, or entity.

For Next.js route handlers:

- Keep the required `app/api/**/route.ts` file at the framework path.
- Put app-wide handler composition under `src/_app/api-routes`.
- Put feature-specific action/policy implementation in the feature's `api`
  segment when it changes with that feature.
- Do not build a large backend inside a frontend FSD tree. Move a substantial
  service surface to a separate workspace/package.

For Server Actions:

- Put the action with the feature or page that owns the user interaction.
- Use a runtime-revealing name such as `create-invitation.server.ts` when the
  framework permits it, and keep `"use server"` or `server-only` at the narrow
  server boundary.
- Validate untrusted action input with the owning Zod schema.
- Keep authentication/authorization on the server even when client UI gates
  the interaction.
- Call the action from a client adapter or form boundary; do not export it
  through a client-facing aggregate module.

For SSR loaders and prefetching, keep route orchestration in the page/app layer
and reuse feature/entity query option factories or server-safe transport
functions. Avoid separate client and SSR implementations of the same contract.

## API versus server state

Use one owner per responsibility:

| Concern | Owner |
| --- | --- |
| Axios instance, interceptors, cancellation, normalized transport errors | `shared/api` |
| Generated backend client | generated boundary or `shared/api` wrapper |
| Feature endpoint function or Server Action | owner `api` |
| Zod response/request schema | owner `api` or `model`, at the trust boundary |
| TanStack Query key, options, hook, mutation, cache effect | owner `server-state` |
| QueryClient construction and app hydration provider | `_app/providers` or app server-state setup |
| Proven generic query option/auth helpers | focused shared server-state foundation |

Do not create `api` only to mirror functions already owned by a generated
client or Server Action. Do not put TanStack Query hooks in `api`; they own
remote cache lifecycle, not transport. Route implementation questions to
`$manage-server-state`.

When remote data is reused by several features as a stable business noun, an
entity may own the read/query contract. Keep mutations that represent a
user-valued interaction in the feature and coordinate entity cache effects
through explicit lower-layer APIs.

## Providers and stores

Put application composition in `_app/providers`: QueryClient, theme, i18n,
router, authentication session, and error/reporting providers. Keep provider
implementations beside the subsystem they adapt when the implementation is not
app-wide, then compose them in the app provider tree.

Use scoped Zustand stores inside the feature/entity `model` that owns their
client-only state. Put only store creation helpers or app-wide store composition
in Shared/App. Never mirror TanStack Query records into Zustand by default.

## Integrations and internal libraries

Use `shared/integrations/<vendor>` for third-party SDK initialization, thin
vendor adapters, consent-aware event dispatch, and runtime-specific setup.
Examples include Firebase, Google Analytics, Amplitude, Sentry, Stripe.js, or a
feature flag SDK.

Use `shared/lib/<purpose>` for focused internal libraries such as date
formatting, currency arithmetic, text normalization, or typed event helpers.
Name the purpose and define what does not belong there. Do not use `libs` as a
mixed bucket for vendor code, generic helpers, and business policy.

The app layer decides when an integration starts. A feature decides when a
business event occurs and calls a narrow integration API. The integration must
not import the feature.

## Firebase example

Prefer runtime-specific direct modules:

```text
src/shared/integrations/firebase/
├── client/
│   ├── client-app.ts
│   ├── get-auth.ts
│   └── get-remote-config.ts
├── server/
│   ├── server-app.ts
│   └── get-admin-auth.ts
└── config/
    └── remote-config-default.json
```

- `client-app.ts` initializes the browser SDK once from client-safe config.
- `server-app.ts` initializes the Admin/server SDK and never enters a client
  dependency graph.
- Getter modules contain the public implementation and import the correct app
  module directly; do not re-export them from `index.ts`.
- Remote Config defaults are static integration config. Feature-specific flag
  interpretation stays in the feature or app policy that owns it.
- Server credentials come from validated server environment access and are
  never serialized into client config.

For analytics, keep vendor adapters under `shared/integrations/analytics` or
separate vendor folders. Compose consent and initial page tracking in `_app`.
Keep event names and payload builders beside the feature when they express
feature semantics, unless a typed analytics contract is deliberately shared.

## Environment, assets, and localization

Parse environment variables at one typed boundary under `shared/config/env`,
with separate client-safe and server-only access when required. Do not import a
server environment module from a client file. Avoid a second `constants` tree
for values already owned by environment or feature config.

Put imported images, icons, fonts, and other bundled files under
`shared/assets` or the owning slice. Put files that must retain a stable public
URL under root `public`. Do not duplicate one asset in both places.

Put i18n initialization, locale negotiation, and genuinely shared messages in
`shared/i18n`. Keep feature-specific messages with the feature when the i18n
tooling supports colocated namespaces; otherwise preserve the project's locale
catalog but keep keys namespaced by owner.
