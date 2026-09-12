import * as z from "zod"

import { api } from "../../../server-state/api"
import type { ProposalForm } from "../proposal-form"

export const proposalCreatedSchema = z.object({
  id: z.string(),
  status: z.enum(["draft", "in-review"]),
})

export type ProposalCreated = z.infer<typeof proposalCreatedSchema>

const proposalRoutes = {
  collection: "/proposals",
} as const

export const proposalsApi = {
  async create(values: ProposalForm) {
    const response = await api.post<unknown>(proposalRoutes.collection, values)

    return proposalCreatedSchema.parse(response.data)
  },
} as const
