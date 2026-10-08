import { api } from "@/lib/api"

import type {
  Notification,
  NotificationFilter,
  NotificationType,
  NotificationsPage,
} from "../types"

const PAGE_SIZE = 20

const notificationTypes: NotificationType[] = [
  "assigned",
  "commented",
  "status_changed",
]

function parseNotification(value: Notification): Notification {
  if (!notificationTypes.includes(value.type)) {
    throw new Error(`Unknown notification type: ${value.type}`)
  }

  return value
}

export const notificationsApi = {
  pageSize: PAGE_SIZE,

  async list({
    projectId,
    filter,
    page,
  }: {
    projectId: string
    filter: NotificationFilter
    page: number
  }) {
    const response = await api.get<NotificationsPage>(
      `/projects/${encodeURIComponent(projectId)}/notifications?filter=${filter}&page=${page}&limit=${PAGE_SIZE}`
    )

    return {
      ...response,
      notifications: response.notifications.map(parseNotification),
    }
  },

  unreadCount(projectId: string) {
    return api.get<{ count: number }>(
      `/projects/${encodeURIComponent(projectId)}/notifications/unread-count`
    )
  },

  async markRead(notificationId: string) {
    const notification = await api.post<Notification>(
      `/notifications/${encodeURIComponent(notificationId)}/read`
    )

    return parseNotification(notification)
  },

  markAllRead(projectId: string) {
    return api.post<void>(
      `/projects/${encodeURIComponent(projectId)}/notifications/read-all`
    )
  },
}
