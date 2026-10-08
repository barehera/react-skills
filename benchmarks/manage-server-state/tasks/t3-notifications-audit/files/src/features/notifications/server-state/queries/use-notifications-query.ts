import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { useSession } from "@/hooks/use-session"

import type { NotificationFilter, NotificationsPage } from "../../types"
import { notificationsApi } from "../api"
import { notificationKeys } from "../keys"

/** First page of notifications, used by the bell popover. */
export function useNotificationsQuery(
  projectId: string,
  filter: NotificationFilter,
  options?: Partial<UseQueryOptions<NotificationsPage>>
) {
  const session = useSession()

  return useQuery({
    queryKey: notificationKeys.list(projectId),
    queryFn: () => notificationsApi.list({ projectId, filter, page: 1 }),
    enabled: session.status === "authenticated",
    ...options,
  })
}
