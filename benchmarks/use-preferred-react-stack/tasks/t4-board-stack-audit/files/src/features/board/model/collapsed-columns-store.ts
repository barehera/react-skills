import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { TaskStatus } from "@/features/tasks/types"

const initialState: { collapsed: TaskStatus[] } = { collapsed: [] }

type CollapsedColumnsState = typeof initialState & {
  toggle: (status: TaskStatus) => void
  reset: () => void
}

/** Device-level layout preference (BOARD-3): one board per browser. */
export const useCollapsedColumnsStore = create<CollapsedColumnsState>()(
  persist(
    (set) => ({
      ...initialState,
      toggle: (status) =>
        set((state) => ({
          collapsed: state.collapsed.includes(status)
            ? state.collapsed.filter((item) => item !== status)
            : [...state.collapsed, status],
        })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "board-collapsed-columns",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
)
