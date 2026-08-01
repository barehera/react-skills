"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ProposalDetails } from "./components/proposal-details"
import { ProposalPreview } from "./components/proposal-preview"
import {
  PROPOSAL_DEFAULT_VALUES,
  ProposalFormRoot,
  proposalSchema,
  submitProposal,
  type ProposalForm,
} from "./proposal-form"

export function ProposalScreen() {
  const form = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: PROPOSAL_DEFAULT_VALUES,
    mode: "onBlur",
  })

  return (
    <ProposalFormRoot form={form} onSubmit={submitProposal}>
      <ProposalDetails />
      <ProposalPreview />
      <button type="submit" disabled={form.formState.isSubmitting}>
        Submit proposal
      </button>
    </ProposalFormRoot>
  )
}
