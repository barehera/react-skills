import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task, TaskStatus } from "../../types"
import { taskKeys } from "../keys"

type BulkUpdateTaskStatusInput = {
  projectId: string
  taskIds: string[]
  status: TaskStatus
}

export function useBulkUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, taskIds, status }: BulkUpdateTaskStatusInput) =>
      api.patch<Task[]>(`/projects/${projectId}/tasks/bulk`, {
        taskIds,
        status,
      }),
    onSuccess: (updated, { projectId }) => {
      for (const task of updated) {
        queryClient.setQueryData(taskKeys.detail(task.id), task)
      }
      return queryClient.invalidateQueries({
        queryKey: taskKeys.list(projectId),
      })
    },
  })
}
