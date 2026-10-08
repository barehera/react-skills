# Zustand scope and persistence

| Shape | Use when |
| --- | --- |
| `create<State>()(...)` browser singleton | One intentionally app-wide browser lifetime, with no request-specific server state |
| `createStore<State>()(...)` + provider + `useStore(store, selector)` | A feature/subtree lifetime, repeated instances, or server rendering/request isolation |

In Next.js, create the store once per provider. `use client` neither prevents
server prerendering nor makes a module singleton request-safe, so never put
user/request data in a shared server singleton or touch a client store from a
Server Component.

Keep an initial-state value and a named reset action. Type the scoped store as
`ReturnType<typeof createPreferencesStore>`, pass only that handle through
context, and subscribe to individual values and actions.

Add `persist` with `createJSONStorage` (from `zustand/middleware`) only when
state must survive reload. `partialize` keeps durable preferences and IDs;
never persist fetched snapshots, pending flags, or actions, and resolve
persisted IDs against fresh server data.

With SSR, skip automatic hydration and rehydrate on the client after mount so
the first render matches the server; gate dependent behavior until hydration
when needed. A reset should update persisted values; `clearStorage()` alone
does not reset in-memory state.

Placement follows the business owner via `feature-sliced-design`: app
composition wires providers; the feature or entity `model` owns its state.
`store/` and `features/<feature>/store/` are origin conventions, not catalog
mandates. Compound instance state routes to `build-composable-components`.
