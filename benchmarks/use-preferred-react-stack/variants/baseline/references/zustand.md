# Zustand scope and persistence

Choose scope before choosing `create` versus `createStore`.

| Shape | Use when |
| --- | --- |
| `create<State>()(...)` browser singleton | One intentionally app-wide browser lifetime, with no request-specific server state |
| `createStore<State>()(...)` + provider + `useStore(store, selector)` | A feature/subtree lifetime, repeated instances, or server rendering/request isolation |

The canonical Next.js choice is a store created once per provider. A `use client`
directive does not prevent server prerendering and does not make a module
singleton request-safe. Never put user/request data into a shared server
singleton or read/write a client store from a Server Component.

Keep an initial-state value and a named reset action. Use
`ReturnType<typeof createPreferencesStore>` for the scoped store type and carry
only that stable handle through context. Subscribe to individual values/actions.

Use `persist` and `createJSONStorage` from `zustand/middleware` only when reload
survival is required. `partialize` selects durable preferences/identifiers.
Never persist fetched object snapshots, transient pending flags, or actions.
Resolve persisted IDs against fresh server data. Define account-switch reset,
schema migrations, and storage availability according to the product contract.

With SSR, skip automatic hydration and rehydrate on the client after mount.
Use the same initial render on server and client; gate dependent behavior until
hydration completes when necessary. A reset should update persisted values;
`clearStorage()` alone does not reset in-memory state.

Read the complete preferences store/provider example and the browser-only
banner store. Place them by business owner with `feature-sliced-design`:
app composition wires providers; feature/entity `model` owns its state.
`store/` and `features/<feature>/store/` are origin conventions, not new
catalog-wide directory mandates. Compound instance state routes to
`build-composable-components`.

Primary references: [Zustand Next.js guide](https://zustand.docs.pmnd.rs/guides/nextjs)
and [persistence](https://zustand.docs.pmnd.rs/integrations/persisting-store-data).
