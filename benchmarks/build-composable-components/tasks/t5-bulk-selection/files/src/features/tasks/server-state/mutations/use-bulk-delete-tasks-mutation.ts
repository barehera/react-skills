import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { taskKeys } from "../keys"

type BulkDeleteTasksInput = {
  projectId: string
  taskIds: string[]
}

/**
 * Deletes several tasks in one request, drops their detail caches, and
 * refetches the project list. Deleted tasks cannot be restored.
 */
export function useBulkDeleteTasksMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, taskIds }: BulkDeleteTasksInput) =>
      api.post<void>(`/projects/${projectId}/tasks/bulk-delete`, { taskIds }),
    onSuccess: (_data, { projectId, taskIds }) => {
      for (const taskId of taskIds) {
        queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) })
      }
      return queryClient.invalidateQueries({
        queryKey: taskKeys.list(projectId),
      })
    },
  })
}
