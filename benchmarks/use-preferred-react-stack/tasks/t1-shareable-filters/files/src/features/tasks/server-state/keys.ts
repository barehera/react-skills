import type { TaskStatus } from "../types"

export type TaskListFilters = {
  search?: string
  status?: TaskStatus
}

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (projectId: string) => [...taskKeys.lists(), projectId] as const,
  filteredList: (projectId: string, filters: TaskListFilters) =>
    [...taskKeys.list(projectId), filters] as const,
  detail: (taskId: string) => [...taskKeys.all, "detail", taskId] as const,
}
