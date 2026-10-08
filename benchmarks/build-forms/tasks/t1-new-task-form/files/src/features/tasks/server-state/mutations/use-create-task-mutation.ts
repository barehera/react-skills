import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task, TaskStatus } from "../../types"
import { taskKeys } from "../keys"

export type CreateTaskInput = {
  projectId: string
  title: string
  description?: string
  status: TaskStatus
}

/**
 * Throws `ApiError` (see `@/lib/api`). Status 409 means the project already
 * has a task with this title.
 */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, ...body }: CreateTaskInput) =>
      api.post<Task>(`/projects/${projectId}/tasks`, body),
    onSuccess: (created) =>
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(created.projectId),
      }),
  })
}
