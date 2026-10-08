import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import type {
  ChecklistItem,
  RepeatInterval,
  Task,
  TaskStatus,
} from "../../types"
import { taskKeys } from "../keys"

export type UpdateTaskInput = {
  taskId: string
  title: string
  status: TaskStatus
  checklist?: ChecklistItem[]
  /** Omit when the task does not repeat; the API clears the schedule. */
  repeatEvery?: RepeatInterval
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, ...body }: UpdateTaskInput) =>
      api.patch<Task>(`/tasks/${taskId}`, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated)
      return queryClient.invalidateQueries({
        queryKey: taskKeys.list(updated.projectId),
      })
    },
  })
}
