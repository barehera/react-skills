import type { TaskStatus } from "@/features/tasks/types"

export type TaskStatusFilter = TaskStatus | "all"

export type TaskFilterState = {
  status: TaskStatusFilter
  search: string
}
