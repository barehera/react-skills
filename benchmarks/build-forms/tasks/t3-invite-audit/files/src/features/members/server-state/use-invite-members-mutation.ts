import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

import { memberKeys } from "./use-members-query"

export type InviteMembersInput = {
  projectId: string
  invitees: { email: string; role: "editor" | "viewer" }[]
  note?: string
}

/** Throws `ApiError`; status 409 means someone is already a member. */
export function useInviteMembersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, ...body }: InviteMembersInput) =>
      api.post<{ invited: number }>(`/projects/${projectId}/invites`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  })
}
