import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Task, TaskStatus } from "@/features/tasks/types"

export type BoardStatusFilter = TaskStatus | "all"

type BoardState = {
  search: string
  status: BoardStatusFilter
  tasks: Task[]
  isRefreshing: boolean
  setSearch: (search: string) => void
  setStatus: (status: BoardStatusFilter) => void
  setTasks: (tasks: Task[]) => void
  setRefreshing: (isRefreshing: boolean) => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      search: "",
      status: "all",
      tasks: [],
      isRefreshing: false,
      setSearch: (search) => set({ search }),
      setStatus: (status) => set({ status }),
      setTasks: (tasks) => set({ tasks }),
      setRefreshing: (isRefreshing) => set({ isRefreshing }),
    }),
    { name: "board" }
  )
)
