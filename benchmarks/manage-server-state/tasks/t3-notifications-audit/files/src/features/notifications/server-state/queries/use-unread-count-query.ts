import { useQuery } from "@tanstack/react-query"

import { useSession } from "@/hooks/use-session"

import { notificationsApi } from "../api"
import { notificationKeys } from "../keys"

export function useUnreadCountQuery(projectId: string) {
  const session = useSession()

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.unreadCount(projectId),
    select: (data) => data.count,
    enabled: session.status === "authenticated",
    refetchInterval: 30_000,
  })
}
