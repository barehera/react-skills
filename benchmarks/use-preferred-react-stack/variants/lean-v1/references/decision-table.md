# Setup boundaries per library

- **TanStack Query and Axios**: route their structure to `manage-server-state`;
  do not invent a backend contract to demonstrate them.
- **nuqs**: typed parsers from `nuqs` with explicit defaults and the matching
  adapter (`NuqsAdapter` from `nuqs/adapters/next/app` for the Next App Router;
  server-only parsing from `nuqs/server`). Choose replace versus push and
  shallow versus server navigation deliberately; test back/forward and
  clearing. Do not mirror the URL in a Zustand store.
- **React Hook Form**: a search filter alone does not need a submitted form
  model; form structure routes to `build-forms`.
- **next-intl**: `useTranslations` from `next-intl` in React components,
  `getTranslations` from `next-intl/server` in async server components. Reuse
  the existing request configuration, provider, and locale files; use message
  keys and interpolation, and add no translations for locales out of scope.
- **sonner**: `toast` and `Toaster` from `sonner`. Reuse the existing app-level
  Toaster (often the shadcn wrapper). Notify from one lifecycle owner, not
  during render or once per query observer; use a stable ID where an event can
  repeat, and keep a visible, recoverable error.
- **T3 Env**: `createEnv` from `@t3-oss/env-nextjs` with centralized Zod
  schemas, separate server/client access, and explicit Next public variables;
  follow the installed version's runtime env mapping. Never import secrets into
  client code or log parsed env values.
