import * as z from "zod"

import { createForm } from "../form/components/form"

export const proposalSchema = z.object({
  title: z.string().min(3, "Use a recognizable title."),
  owner: z.string().min(2, "Add the proposal owner."),
  surface: z.enum(["web", "mobile", "embedded"]),
})

export type ProposalForm = z.infer<typeof proposalSchema>

export const PROPOSAL_DEFAULT_VALUES: ProposalForm = {
  title: "",
  owner: "",
  surface: "web",
}

export const PROPOSAL_SURFACES = [
  { value: "web", label: "Web application" },
  { value: "mobile", label: "Mobile application" },
  { value: "embedded", label: "Embedded experience" },
] as const satisfies ReadonlyArray<{
  value: ProposalForm["surface"]
  label: string
}>

export const {
  Form: ProposalFormRoot,
  useForm: useProposalForm,
} = createForm<ProposalForm>()

export async function submitProposal(values: ProposalForm) {
  // Replace this development example with the feature's mutation hook.
  return values
}
