import * as z from "zod"

export const crewMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["lead", "crew"]),
})

export const shiftCrewSchema = z.object({
  shiftId: z.string(),
  members: z.array(crewMemberSchema),
  assignedMemberIds: z.array(z.string()),
})

export const assignShiftCrewRequestSchema = z.object({
  memberIds: z.array(z.string()),
})
