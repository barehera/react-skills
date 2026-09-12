"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { proposalsApi } from "../api"

const proposalsListKey = ["proposals", "list"] as const

export function useCreateProposalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: proposalsApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: proposalsListKey }),
  })
}
