# Library search composition

Task: add shareable book search, wait for typing to settle before requesting
records, remember sort order across reloads, and notify on failed requests.

First inspect `package.json`, the lockfile, configured providers, and compiler
configuration. The checked example uses Pacer 0.18.0, nuqs 2.10.1, sonner 2.0.8,
and the repository's Zustand 5/React 19 packages. Recheck installed versions.

Use `use-library-search.ts` as the complete selection/composition hook:

1. Mount the existing App Router `NuqsAdapter`, QueryClientProvider, Toaster,
   and next-intl configuration at their existing app boundaries. Do not create
   duplicate providers. A Next page using client URL hooks may need the
   framework's Suspense boundary; follow its actual rendering mode.
2. Mount `PreferencesProvider` with a stable, appropriately account-scoped
   `storageKey`. Remount with a new React `key` on an account/key change; the
   example treats the key as an initial input. Hydration happens after mount.
   Initial sort is `name`; a persisted sort can subsequently trigger a refetch.
   Gate the query until hydration if that initial request is undesirable.
3. Connect an existing shadcn Input to `search`/`setSearch`. The URL updates
   immediately; Pacer debounces the derived request input, including changes
   caused by browser back/forward. There is no second writable search store.
4. Pass `settledSearch` and `sortOrder` to the feature query hook created with
   `manage-server-state`; enable it when `!isDebouncing`. TanStack Query owns
   records and request retries, and its Axios transport receives the abort
   signal. Do not put debounce inside the query function or persist results.
5. Call `notifyLibrarySearchFailure` from one established query error owner
   after final failure, using a translated next-intl message. Retain a visible
   error and retry action in the UI. Do not also notify from every observer.

The hook exercises only stack selection responsibilities; backend contracts,
query options, field anatomy, and app bootstrap remain with their existing
owners. The TypeScript harness checks it against actual installed APIs.

Browser integration checks in the consuming app: rapid typing makes one
settled request; navigation restores the URL filter; unmount cancels pending
debounce; reload restores sort; two provider instances do not share memory;
failure emits one notice and leaves a recovery path. Repository typechecking
does not replace these browser checks.

`banner-store.ts` is a separate browser-only singleton example for one
app-wide dismissed banner ID. Do not import it into a Next SSR request path.
The Next.js canonical pattern is the scoped preferences provider.
