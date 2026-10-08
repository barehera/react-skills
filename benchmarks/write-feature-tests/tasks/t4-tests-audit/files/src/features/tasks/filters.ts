import { includesOption } from "@/lib/options"

import type { TaskStatus } from "./types"

export type TaskSort = "createdAt" | "dueDate" | "title"

export type TaskFilters = {
  search: string
  status: TaskStatus | null
  assigneeId: string | null
  page: number
  sort: TaskSort
}

export const TASK_SORTS = ["createdAt", "dueDate", "title"] as const satisfies readonly TaskSort[]

export const DEFAULT_TASK_FILTERS = {
  search: "",
  status: null,
  assigneeId: null,
  page: 1,
} as const satisfies Omit<TaskFilters, "sort">

// Business Logic: Resetting the task list clears every filter and returns to the first page, but keeps the chosen sort.
// Why: People reset to see everything again; losing their sort order made the list feel like it had reshuffled.
// Rule: Never reset the sort when clearing filters.
export function resetTaskFilters(filters: TaskFilters): TaskFilters {
  return { ...DEFAULT_TASK_FILTERS, sort: filters.sort }
}

export function parseTaskSort(value: string | null): TaskSort {
  return value !== null && includesOption(TASK_SORTS, value) ? value : "createdAt"
}
