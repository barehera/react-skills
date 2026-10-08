import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Notification, NotificationsPage } from "../../types"
import { notificationsApi } from "../api"
import { notificationKeys } from "../keys"

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notification: Notification) =>
      notificationsApi.markRead(notification.id),
    onMutate: (notification) => {
      const previous = queryClient.getQueriesData({
        queryKey: notificationKeys.all,
      })

      queryClient.setQueriesData<NotificationsPage>(
        { queryKey: notificationKeys.all },
        (page) =>
          page && {
            ...page,
            notifications: page.notifications.map((item) =>
              item.id === notification.id ? { ...item, read: true } : item
            ),
          }
      )

      return { previous }
    },
    onError: (_error, _notification, context) => {
      context?.previous.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data)
      )
    },
    onSettled: () => queryClient.invalidateQueries(),
  })
}
