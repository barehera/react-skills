import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task } from "../../types"
import { taskKeys, type TaskListFilters } from "../keys"

function toSearchParams(filters: TaskListFilters) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.status) params.set("status", filters.status)
  const query = params.toString()
  return query === "" ? "" : `?${query}`
}

/** The API filters by `search` (title contains) and `status`. */
export function useTasksQuery(projectId: string, filters: TaskListFilters = {}) {
  return useQuery({
    queryKey: taskKeys.filteredList(projectId, filters),
    queryFn: () =>
      api.get<Task[]>(`/projects/${projectId}/tasks${toSearchParams(filters)}`),
    placeholderData: keepPreviousData,
  })
}

export function useTaskQuery(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => api.get<Task>(`/tasks/${taskId}`),
  })
}
