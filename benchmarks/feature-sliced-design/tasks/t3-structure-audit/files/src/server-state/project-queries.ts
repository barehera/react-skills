import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

export type Project = {
  id: string
  name: string
  plan: "free" | "pro"
}

export type TaskComment = {
  id: string
  taskId: string
  authorName: string
  body: string
  createdAt: string
}

export const queryKeys = {
  project: (projectId: string) => ["project", projectId] as const,
  taskComments: (taskId: string) => ["task-comments", taskId] as const,
}

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.get<Project>(`/projects/${projectId}`),
  })
}

export function useRenameProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) =>
      api.patch<Project>(`/projects/${projectId}`, { name }),
    onSuccess: (project) =>
      queryClient.setQueryData(queryKeys.project(project.id), project),
  })
}

export function useTaskCommentsQuery(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskComments(taskId),
    queryFn: () => api.get<TaskComment[]>(`/tasks/${taskId}/comments`),
  })
}
