import { createStore } from "zustand/vanilla"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"

export type SortOrder = "name" | "recent"
const initialState: { sortOrder: SortOrder } = { sortOrder: "name" }

type PreferencesState = typeof initialState & {
  setSortOrder: (sortOrder: SortOrder) => void
  reset: () => void
}

export function createPreferencesStore(storage: StateStorage, key: string) {
  return createStore<PreferencesState>()(persist(
    set => ({
      ...initialState,
      setSortOrder: sortOrder => set({ sortOrder }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: key,
      storage: createJSONStorage(() => storage),
      partialize: state => ({ sortOrder: state.sortOrder }),
      skipHydration: true,
    },
  ))
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>
