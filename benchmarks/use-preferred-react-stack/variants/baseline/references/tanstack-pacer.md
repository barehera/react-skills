# TanStack Pacer imports and lifetimes

Verified against `@tanstack/react-pacer` **0.18.0** package exports and runtime
symbols. Recheck when the installed version differs. The import map below is
validated by `scripts/verify-pacer.mjs`; run it from the consuming project root
so it resolves that project's installation. It prints all exported subpaths.

| Operation | Subpath after `@tanstack/react-pacer/` | Class | React hook |
| --- | --- | --- | --- |
| Debounce | `debouncer` | `Debouncer` | `useDebouncedCallback`, `useDebouncer`, `useDebouncedValue` |
| Throttle | `throttler` | `Throttler` | `useThrottler` |
| Rate limit | `rate-limiter` | `RateLimiter` | `useRateLimiter` |
| Queue | `queuer` | `Queuer` | `useQueuer`, `useQueuedState` |
| Batch | `batcher` | `Batcher` | `useBatcher` |
| Async queue | `async-queuer` | `AsyncQueuer` | `useAsyncQueuer` |
| Retry | `async-retryer` | `AsyncRetryer` | No React retry hook in this version |

Additional exports: the root, `async-batcher`, `async-debouncer`,
`async-rate-limiter`, `async-throttler`, `provider`, `types`, `utils`, and
`package.json`. There is no `ratelimiter` or `queue` subpath.
`useRateLimiter` and `useQueuedState` are real exports; the reported defect was
their import paths, not proof those hooks do not exist.

Inside React use hooks for component lifetime and current callbacks:

```ts
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'

function useDelayedSearch(commit: (search: string) => void) {
  return useDebouncedCallback(commit, { wait: 400 })
}
```

Use `useDebouncer` when explicit cancel/flush or reactive state is needed;
opt into a selector for instance state you render. The canonical search hook
uses `useDebouncedValue` to derive request input from authoritative URL state.
The 0.18.0 hook cancels pending work on unmount. Verify cancellation and stale
callback behavior for the installed release.

Outside React use a class, scoped to the actual service lifetime:

```ts
import { RateLimiter } from '@tanstack/react-pacer/rate-limiter'

function createNoticeLimiter(notify: (message: string) => void) {
  return new RateLimiter(notify, {
    limit: 1, window: 60_000, windowType: 'sliding',
  })
}
```

Create this once for call sites intended to share a budget, rather than once
per call. Do not accidentally share user-specific rate budgets across server
requests. A frontend limiter is not a server enforcement mechanism. Clean up
pending class work when its owner ends. Query retries remain in Query; reserve
Pacer retry for independently owned non-Query work.

Primary sources: [package source](https://github.com/TanStack/pacer/tree/main/packages/react-pacer)
and [React callback API](https://tanstack.com/pacer/latest/docs/framework/react/reference/functions/useDebouncedCallback).
The local pinned package, not the changing `latest` docs, backs the map above.
