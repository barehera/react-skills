export type NotificationType = "assigned" | "commented" | "status_changed"

export type Notification = {
  id: string
  projectId: string
  type: NotificationType
  title: string
  read: boolean
  actorId: string | null
  createdAt: string
}

export type NotificationsPage = {
  notifications: Notification[]
  nextCursor: string | null
}

export type NotificationFilter = "all" | "unread"
