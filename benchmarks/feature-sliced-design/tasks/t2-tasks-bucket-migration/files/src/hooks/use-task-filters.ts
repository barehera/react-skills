import { create } from "zustand"

import type { TaskFilterState, TaskStatusFilter } from "@/types/task-filter"

type TaskFilterStore = TaskFilterState & {
  setStatus: (status: TaskStatusFilter) => void
  setSearch: (search: string) => void
  reset: () => void
}

const initialState: TaskFilterState = { status: "all", search: "" }

export const useTaskFilters = create<TaskFilterStore>()((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  reset: () => set(initialState),
}))
