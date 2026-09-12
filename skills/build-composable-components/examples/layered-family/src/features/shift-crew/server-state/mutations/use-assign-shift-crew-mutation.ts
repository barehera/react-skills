"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { shiftCrewApi } from "../api"
import { shiftCrewKeys } from "../queries/keys"
import type { AssignShiftCrewInput, ShiftCrew } from "../types"

type AssignShiftCrewVariables = Omit<AssignShiftCrewInput, "shiftId">

export function useAssignShiftCrewMutation({ shiftId }: { shiftId: string }) {
  const queryClient = useQueryClient()
  const detailKey = shiftCrewKeys.detail(shiftId)

  return useMutation({
    mutationFn: (variables: AssignShiftCrewVariables) =>
      shiftCrewApi.assign({ shiftId, ...variables }),
    onMutate: async ({ memberIds }) => {
      await queryClient.cancelQueries({ queryKey: detailKey })

      const previous = queryClient.getQueryData<ShiftCrew>(detailKey)

      if (previous) {
        queryClient.setQueryData<ShiftCrew>(detailKey, {
          ...previous,
          assignedMemberIds: memberIds,
        })
      }

      return { previous }
    },
    onError: (_error, _variables, onMutateResult) => {
      if (onMutateResult?.previous) {
        queryClient.setQueryData(detailKey, onMutateResult.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: detailKey }),
  })
}
