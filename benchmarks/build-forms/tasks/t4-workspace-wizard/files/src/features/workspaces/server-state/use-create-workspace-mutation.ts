import { useMutation } from "@tanstack/react-query"

import { api } from "@/lib/api"

export type TeamSize = "1-10" | "11-50" | "51+"

export type CreateWorkspaceInput = {
  owner: {
    fullName: string
    email: string
    phone?: string
  }
  workspace: {
    name: string
    slug: string
    teamSize: TeamSize
  }
}

export type Workspace = {
  id: string
  name: string
  slug: string
}

/** Throws `ApiError` (see `@/lib/api`). Status 409 means the slug is taken. */
export function useCreateWorkspaceMutation() {
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) =>
      api.post<Workspace>("/workspaces", input),
  })
}
