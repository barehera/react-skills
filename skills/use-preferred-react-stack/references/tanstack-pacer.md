# TanStack Pacer imports and lifetimes

Verified against `@tanstack/react-pacer` **0.18.0**. When the installed version
differs, recheck by running `scripts/verify-pacer.mjs` from the consuming
project root; it prints every exported subpath.

| Operation | Subpath after `@tanstack/react-pacer/` | Class | React hook |
| --- | --- | --- | --- |
| Debounce | `debouncer` | `Debouncer` | `useDebouncedCallback`, `useDebouncer`, `useDebouncedValue` |
| Throttle | `throttler` | `Throttler` | `useThrottler` |
| Rate limit | `rate-limiter` | `RateLimiter` | `useRateLimiter` |
| Queue | `queuer` | `Queuer` | `useQueuer`, `useQueuedState` |
| Batch | `batcher` | `Batcher` | `useBatcher` |
| Async queue | `async-queuer` | `AsyncQueuer` | `useAsyncQueuer` |
| Retry | `async-retryer` | `AsyncRetryer` | No React retry hook in this version |

Other exports: the root, `async-batcher`, `async-debouncer`,
`async-rate-limiter`, `async-throttler`, `provider`, `types`, `utils`, and
`package.json`. There is no `ratelimiter` or `queue` subpath; `useRateLimiter`
and `useQueuedState` exist at the subpaths above.

Inside React, use the hooks, which follow the component lifetime and current
callbacks. `useDebouncer` adds explicit cancel/flush and reactive state (select
only the instance state you render); `useDebouncedValue` derives request input
from authoritative state such as the URL. The 0.18.0 hook cancels pending work
on unmount; verify cancellation and stale callbacks for the installed release.

Outside React, use a class scoped to the actual service lifetime:

```ts
import { RateLimiter } from '@tanstack/react-pacer/rate-limiter'

function createNoticeLimiter(notify: (message: string) => void) {
  return new RateLimiter(notify, {
    limit: 1, window: 60_000, windowType: 'sliding',
  })
}
```

Create it once for the call sites that share a budget, not once per call, and
never share user-specific budgets across server requests. A frontend limiter is
not server enforcement. Clean up pending class work when its owner ends. Use
Pacer retry only for work Query does not own; do not multiply retry layers.
