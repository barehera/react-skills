import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/api"

/** Sends the assignee an in-app and email reminder about the task. */
export function useNudgeAssigneeMutation() {
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      api.post<{ sentAt: string }>(`/tasks/${taskId}/nudge`),
  })
}
