import * as z from "zod"

export const proposalSchema = z.object({
  title: z.string().min(3, "Use a recognizable title."),
  owner: z.string().min(2, "Add the proposal owner."),
})
