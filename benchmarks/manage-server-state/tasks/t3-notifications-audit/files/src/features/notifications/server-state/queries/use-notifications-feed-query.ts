import { useInfiniteQuery } from "@tanstack/react-query"

import { useSession } from "@/hooks/use-session"

import { notificationsApi } from "../api"
import { notificationKeys } from "../keys"

/** Full notification history with "Load more", used by the notifications page. */
export function useNotificationsFeedQuery(projectId: string) {
  const session = useSession()

  return useInfiniteQuery({
    queryKey: notificationKeys.list(projectId),
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ projectId, filter: "all", page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.notifications.length === notificationsApi.pageSize
        ? allPages.length + 1
        : undefined,
    enabled: session.status === "authenticated",
  })
}
