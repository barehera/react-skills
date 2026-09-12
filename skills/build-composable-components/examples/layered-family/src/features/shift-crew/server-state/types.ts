import type * as z from "zod"

import type {
  assignShiftCrewRequestSchema,
  crewMemberSchema,
  shiftCrewSchema,
} from "./schemas"

export type CrewMember = z.infer<typeof crewMemberSchema>

export type ShiftCrew = z.infer<typeof shiftCrewSchema>

export type ShiftCrewDetailInput = {
  shiftId: string
  signal?: AbortSignal
}

export type AssignShiftCrewInput = z.infer<
  typeof assignShiftCrewRequestSchema
> & {
  shiftId: string
}
