import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task } from "../../types"
import { taskKeys } from "../keys"

/**
 * Optimistically removes the task from its project list and drops its detail
 * cache. Rolls both back on failure.
 */
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: Task) => api.delete<void>(`/tasks/${task.id}`),
    onMutate: async (task) => {
      const listKey = taskKeys.list(task.projectId)
      const detailKey = taskKeys.detail(task.id)
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const previousList = queryClient.getQueryData<Task[]>(listKey)
      const previousDetail = queryClient.getQueryData<Task>(detailKey)

      queryClient.setQueryData<Task[]>(listKey, (tasks) =>
        tasks?.filter((item) => item.id !== task.id)
      )
      queryClient.removeQueries({ queryKey: detailKey })

      return { previousList, previousDetail }
    },
    onError: (_error, task, context) => {
      queryClient.setQueryData(taskKeys.list(task.projectId), context?.previousList)
      queryClient.setQueryData(taskKeys.detail(task.id), context?.previousDetail)
    },
    onSettled: (_data, _error, task) =>
      queryClient.invalidateQueries({ queryKey: taskKeys.list(task.projectId) }),
  })
}
