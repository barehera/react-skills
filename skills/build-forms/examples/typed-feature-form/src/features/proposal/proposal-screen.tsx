"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ProposalDetails } from "./components/proposal-details"
import { ProposalPreview } from "./components/proposal-preview"
import {
  PROPOSAL_DEFAULT_VALUES,
  ProposalForm,
  proposalSchema,
  submitProposal,
  type ProposalValues,
} from "./proposal-form"

export function ProposalScreen() {
  const form = useForm<ProposalValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: PROPOSAL_DEFAULT_VALUES,
    mode: "onBlur",
  })

  return (
    <ProposalForm form={form} onSubmit={submitProposal}>
      <ProposalDetails />
      <ProposalPreview />
      <button type="submit" disabled={form.formState.isSubmitting}>
        Submit proposal
      </button>
    </ProposalForm>
  )
}
