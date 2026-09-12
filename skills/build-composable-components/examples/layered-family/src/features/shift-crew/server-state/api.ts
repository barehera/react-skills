import { api } from "../../../server-state/api"
import { parseApiPayload } from "../../../server-state/utils"

import { assignShiftCrewRequestSchema, shiftCrewSchema } from "./schemas"
import type { AssignShiftCrewInput, ShiftCrewDetailInput } from "./types"

const shiftCrewRoutes = {
  detail: (shiftId: string) => `/shifts/${encodeURIComponent(shiftId)}/crew`,
} as const

export const shiftCrewApi = {
  async detail({ shiftId, signal }: ShiftCrewDetailInput) {
    const response = await api.get<unknown>(shiftCrewRoutes.detail(shiftId), {
      signal,
    })

    return parseApiPayload(shiftCrewSchema, response.data)
  },

  async assign({ shiftId, ...input }: AssignShiftCrewInput) {
    const request = assignShiftCrewRequestSchema.parse(input)
    const response = await api.put<unknown>(
      shiftCrewRoutes.detail(shiftId),
      request
    )

    return parseApiPayload(shiftCrewSchema, response.data)
  },
} as const
