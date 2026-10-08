"use client"

import { zodResolver } from "@hookform/resolvers/zod"

import { ProposalDetails } from "./components/proposal-details"
import { ProposalPreview } from "./components/proposal-preview"
import { ProposalSubmit } from "./components/proposal-submit"
import {
  PROPOSAL_DEFAULT_VALUES,
  ProposalFormRoot,
  proposalSchema,
} from "./proposal-form"
import { useCreateProposalMutation } from "./server-state/mutations/use-create-proposal-mutation"

export function ProposalScreen() {
  const createProposal = useCreateProposalMutation()

  return (
    <ProposalFormRoot
      properties={{
        reviewGroupName: "Launch council",
        submissionDisabled: createProposal.isSuccess,
      }}
      resolver={zodResolver(proposalSchema)}
      defaultValues={PROPOSAL_DEFAULT_VALUES}
      mode="onBlur"
      onSubmit={async (values) => {
        await createProposal.mutateAsync(values)
      }}
    >
      <ProposalDetails />
      <ProposalPreview />
      <ProposalSubmit />
    </ProposalFormRoot>
  )
}
