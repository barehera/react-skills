import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useMarkNotificationReadMutation } from "../server-state/mutations/use-mark-notification-read-mutation"
import { useNotificationsFeedQuery } from "../server-state/queries/use-notifications-feed-query"
import type { NotificationType } from "../types"

const typeLabel: Record<NotificationType, string> = {
  assigned: "Assigned",
  commented: "Comment",
  status_changed: "Status",
}

export function NotificationsPage({ projectId }: { projectId: string }) {
  const feedQuery = useNotificationsFeedQuery(projectId)
  const markNotificationReadMutation = useMarkNotificationReadMutation()

  if (feedQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading notifications…</p>
  }

  if (feedQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Notifications unavailable</AlertTitle>
        <AlertDescription>{feedQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <ul className="divide-y rounded-lg border">
        {feedQuery.data.pages.map((page) =>
          page.notifications.map((notification) => (
            <li key={notification.id} className="flex items-center gap-3 px-4 py-2">
              <Badge variant="secondary">{typeLabel[notification.type]}</Badge>
              <span className="flex-1 truncate text-sm">{notification.title}</span>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markNotificationReadMutation.mutate(notification)}
                >
                  Mark read
                </Button>
              )}
            </li>
          ))
        )}
      </ul>
      {feedQuery.hasNextPage && (
        <Button
          variant="outline"
          disabled={feedQuery.isFetchingNextPage}
          onClick={() => feedQuery.fetchNextPage()}
        >
          Load more
        </Button>
      )}
    </section>
  )
}
