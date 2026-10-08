import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notificationsApi } from "../api"
import { notificationKeys } from "../keys"

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => notificationsApi.markAllRead(projectId),
    onSuccess: (_data, projectId) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]),
  })
}
