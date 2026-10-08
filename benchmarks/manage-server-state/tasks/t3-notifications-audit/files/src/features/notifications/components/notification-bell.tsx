import { useQueryClient } from "@tanstack/react-query"
import { Bell } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useMarkAllReadMutation } from "../server-state/mutations/use-mark-all-read-mutation"
import { useMarkNotificationReadMutation } from "../server-state/mutations/use-mark-notification-read-mutation"
import { useNotificationsQuery } from "../server-state/queries/use-notifications-query"
import { useUnreadCountQuery } from "../server-state/queries/use-unread-count-query"

export function NotificationBell({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const unreadCountQuery = useUnreadCountQuery(projectId)
  const notificationsQuery = useNotificationsQuery(projectId, "unread", {
    refetchInterval: 60_000,
  })
  const markNotificationReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllReadMutation()

  const unreadCount = unreadCountQuery.data ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => notificationsQuery.refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={markAllReadMutation.isPending}
            onClick={() =>
              markAllReadMutation.mutate(projectId, {
                onSuccess: () =>
                  queryClient.setQueryData(["notifications", "unread"], {
                    count: 0,
                  }),
              })
            }
          >
            Mark all read
          </Button>
        </div>
        <ul className="mt-2 flex flex-col gap-1">
          {notificationsQuery.data?.notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent"
                onClick={() => markNotificationReadMutation.mutate(notification)}
              >
                {notification.title}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
