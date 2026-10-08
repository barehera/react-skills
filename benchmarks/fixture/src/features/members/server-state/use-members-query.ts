import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

export type Member = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export const memberKeys = {
  all: ["members"] as const,
  search: (projectId: string, search: string) =>
    [...memberKeys.all, projectId, "search", search] as const,
}

export function useMembersQuery(projectId: string, search: string) {
  return useQuery({
    queryKey: memberKeys.search(projectId, search),
    queryFn: () =>
      api.get<Member[]>(
        `/projects/${projectId}/members?search=${encodeURIComponent(search)}`
      ),
    placeholderData: keepPreviousData,
  })
}
