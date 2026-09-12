# Decision rationale and integration

Use the SKILL.md table for selection. These are setup boundaries, not a second
copy of the form, component, or server-state workflows.

- **Pacer** centralizes debounce, throttle, rate limit, queue, and batch
  lifecycles. Use it for repeated timing policies. Keep request retry/backoff
  in TanStack Query when Query owns the request; do not multiply retry layers.
- **TanStack Query** owns remote records and request lifecycle. **Axios** stays
  below feature queries through the project's transport wrapper. Route both to
  `manage-server-state`; do not invent a backend contract to demonstrate them.
- **Zustand** supports narrow subscriptions for shared reactive client state.
  Do not replace simple props/local state or stable context with a store.
  Persist only intentionally durable preferences/IDs, not Query snapshots.
- **nuqs** owns parsed URL state. Use typed parsers from `nuqs`, explicit
  defaults, and the matching adapter. Next App Router uses `NuqsAdapter` from
  `nuqs/adapters/next/app`. Server-only parsing imports come from `nuqs/server`
  when needed. Decide replace versus push and shallow versus server navigation
  deliberately; test back/forward and clearing. Do not add a Zustand mirror of
  the URL. See [basic usage](https://nuqs.dev/docs/basic-usage) and
  [adapters](https://nuqs.dev/docs/adapters).
- **React Hook Form and Zod** own submitted state and validation via
  `zodResolver` from `@hookform/resolvers/zod`. Route to `build-forms`;
  changing a search filter does not itself require a submitted form model.
- **next-intl** uses `useTranslations` from `next-intl` in supported React
  components and `getTranslations` from `next-intl/server` in async server
  components. Inspect existing request configuration, provider, and locale
  files. Use message keys and interpolation; do not impose the origin
  project's English-only policy or add translations for locales out of scope.
  See [translations](https://next-intl.dev/docs/usage/translations).
- **sonner** exposes `toast` and `Toaster` from `sonner`. Reuse the existing
  app-level Toaster (often the shadcn wrapper). Notify at one lifecycle owner,
  not during render or once per query observer. Use stable IDs where duplicate
  events are possible; retain visible, recoverable errors. See
  [getting started](https://sonner.emilkowal.ski/getting-started).
- **T3 Env** exposes `createEnv` from `@t3-oss/env-nextjs`. Reuse centralized
  Zod schemas with distinct server/client access and explicit Next public
  variables. Do not import secrets into client code or log parsed env values.
  Follow installed-version runtime env mapping; see
  [Next.js setup](https://env.t3.gg/docs/nextjs).
- **React Compiler** optimizes React code when the build enables it. React 19
  alone does not establish that fact. The entrypoint owns the legacy policy;
  see [React's introduction](https://react.dev/learn/react-compiler/introduction).

These libraries are defaults for the concerns listed, not a requirement to
install Next.js, providers, persistence, or a compiler in every React task.
Framer Motion appeared in the report's package inventory but had no actionable
finding or selection boundary; preserve an incumbent animation system.
