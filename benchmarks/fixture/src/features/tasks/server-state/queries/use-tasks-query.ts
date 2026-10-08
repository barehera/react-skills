import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task } from "../../types"
import { taskKeys } from "../keys"

export function useTasksQuery(projectId: string) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: () => api.get<Task[]>(`/projects/${projectId}/tasks`),
  })
}

export function useTaskQuery(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => api.get<Task>(`/tasks/${taskId}`),
  })
}
