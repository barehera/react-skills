export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (projectId: string) => [...taskKeys.lists(), projectId] as const,
  detail: (taskId: string) => [...taskKeys.all, "detail", taskId] as const,
}
