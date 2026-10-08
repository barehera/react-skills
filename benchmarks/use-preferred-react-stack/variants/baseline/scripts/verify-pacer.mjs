import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"

const require = createRequire(resolve(process.cwd(), "package.json"))
const pkg = require("@tanstack/react-pacer/package.json")
const imports = {
  debouncer: ["Debouncer", "useDebouncedCallback", "useDebouncer", "useDebouncedValue"],
  throttler: ["Throttler", "useThrottler"],
  "rate-limiter": ["RateLimiter", "useRateLimiter"],
  queuer: ["Queuer", "useQueuer", "useQueuedState"],
  batcher: ["Batcher", "useBatcher"],
  "async-queuer": ["AsyncQueuer", "useAsyncQueuer"],
  "async-retryer": ["AsyncRetryer"],
}
for (const subpath of Object.keys(pkg.exports)) {
  if (subpath === "./package.json") continue
  require.resolve(`@tanstack/react-pacer${subpath === "." ? "" : subpath.slice(1)}`)
}
for (const [subpath, symbols] of Object.entries(imports)) {
  const module = await import(pathToFileURL(require.resolve(`@tanstack/react-pacer/${subpath}`)))
  for (const symbol of symbols) assert.equal(typeof module[symbol], "function", `${subpath}: ${symbol}`)
}
console.log(`Verified Pacer ${pkg.version}: ${Object.keys(pkg.exports).join(", ")}`)
if (pkg.version !== "0.18.0") console.log("Version differs from the reference; recheck semantics and update verification evidence.")
