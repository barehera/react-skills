import { createForm } from "../form/components/form"
import type { ProposalValues } from "./types/proposal"

export const {
  Form: ProposalForm,
  useForm: useProposalForm,
} = createForm<ProposalValues>()
