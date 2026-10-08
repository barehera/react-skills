import { create } from "zustand"

import type { Task } from "@/features/tasks/types"

type TaskStore = {
  tasks: Task[]
  selectedTaskId: string | null
  setTasks: (tasks: Task[]) => void
  selectTask: (taskId: string | null) => void
}

export const useTaskStore = create<TaskStore>()((set) => ({
  tasks: [],
  selectedTaskId: null,
  setTasks: (tasks) => set({ tasks }),
  selectTask: (selectedTaskId) => set({ selectedTaskId }),
}))
