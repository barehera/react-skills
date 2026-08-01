import type { z } from "zod"

import type { proposalSchema } from "../schemas/proposal-schema"

export type ProposalValues = z.infer<typeof proposalSchema>
