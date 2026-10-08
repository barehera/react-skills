export const notificationKeys = {
  all: ["notifications"] as const,
  list: (projectId: string) =>
    [...notificationKeys.all, "list", projectId] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
}
