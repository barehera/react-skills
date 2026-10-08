import type * as z from "zod"

import type { inviteSchema } from "../schemas/invite-schema"

export type InviteValues = z.infer<typeof inviteSchema>
