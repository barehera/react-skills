import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { taskKeys } from "../keys"

/**
 * Business Logic: Archiving is not optimistic. The server rejects tasks that
 * still have open subtasks (422), so the client cannot predict the result.
 */
export function useArchiveTasksMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskIds }: { projectId: string; taskIds: string[] }) =>
      api.post<void>("/tasks/archive", { taskIds }),
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) }),
  })
}
