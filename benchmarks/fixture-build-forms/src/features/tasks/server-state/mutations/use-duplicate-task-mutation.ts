import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task } from "../../types"
import { taskKeys } from "../keys"

export function useDuplicateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: Task) => api.post<Task>(`/tasks/${task.id}/duplicate`),
    onSuccess: (_created, task) =>
      queryClient.invalidateQueries({ queryKey: taskKeys.list(task.projectId) }),
  })
}
