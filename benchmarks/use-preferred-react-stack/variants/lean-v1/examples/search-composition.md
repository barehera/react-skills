# Library search composition

Shareable book search: the URL holds the filter, requests wait for typing to
settle, sort order survives reload, and a failed request shows one notice.
Checked against Pacer 0.18.0, nuqs 2.10.1, sonner 2.0.8, Zustand 5, and React
19. `use-library-search.ts` is the complete selection hook.

1. Reuse the app's existing providers. A Next page using client URL hooks may
   need the framework's Suspense boundary.
2. Mount `PreferencesProvider` with an account-scoped `storageKey`, and remount
   it with a new React `key` when the account changes, because the key is only
   an initial input. It hydrates after mount, so the first sort is `name` and a
   persisted sort may refetch; gate the query until hydration if that first
   request is unwanted.
3. Bind an existing shadcn Input to `search`/`setSearch`. The URL updates
   immediately; Pacer debounces the derived request input, including
   back/forward changes. There is no second writable search store.
4. Pass `settledSearch` and `sortOrder` to the feature query hook from
   `manage-server-state`, enabled when `!isDebouncing`; its Axios transport
   receives the abort signal. Do not debounce inside the query function.
5. Call `notifyLibrarySearchFailure` with a translated message from one query
   error owner after final failure, and keep a visible error with a retry
   action.
