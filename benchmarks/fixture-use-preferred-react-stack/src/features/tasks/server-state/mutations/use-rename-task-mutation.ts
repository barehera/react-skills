import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type { Task } from "../../types"
import { taskKeys } from "../keys"

export function useRenameTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ task, title }: { task: Task; title: string }) =>
      api.patch<Task>(`/tasks/${task.id}`, { title }),
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated)
      return queryClient.invalidateQueries({
        queryKey: taskKeys.list(updated.projectId),
      })
    },
  })
}
