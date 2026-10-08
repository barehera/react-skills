import * as z from "zod"

export const inviteSchema = z.object({
  invitees: z
    .array(
      z.object({
        email: z.email("Enter a valid email address."),
        role: z.enum(["editor", "viewer"]),
      })
    )
    .min(1, "Invite at least one person.")
    .max(10, "Invite up to 10 people at a time."),
  includeNote: z.boolean(),
  note: z.string().max(500, "Keep the note under 500 characters.").optional(),
})
