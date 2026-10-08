# Hooks compose pure decisions

Read the complete `use-inspection-status.ts` example together with
`inspection.ts`. The hook owns its effect, receives current state from its
owner, and uses a module-private status predicate. It does not fetch records
or create a second state owner merely to demonstrate extraction.

For a real feature, its established Zustand or TanStack Query hook supplies
the state. Return named values such as `isWaiting` and focused actions when
consumers need them; do not force an extra hook around a simple selector.

Move an extracted computation to module scope when it needs no hook calls.
Pass locale-dependent formatters, clocks, or other inputs explicitly when this
keeps the contract useful. A hook-bound event handler may remain a closure.
Moving a function out of a hook does not cache its result, and purity alone
does not guarantee React Compiler will optimize every call.

For new code, write direct calculations first. Follow the stack skill's
compiler/legacy boundary instead of removing unrelated memoization. Preserve
effect dependency lists and test changed transitions rather than textual
matches for a particular function name.
