"use client"

import { zodResolver } from "@hookform/resolvers/zod"

import { ProposalDetails } from "./components/proposal-details"
import { ProposalPreview } from "./components/proposal-preview"
import { ProposalSubmit } from "./components/proposal-submit"
import {
  PROPOSAL_DEFAULT_VALUES,
  ProposalFormRoot,
  proposalSchema,
  submitProposal,
} from "./proposal-form"

export function ProposalScreen() {
  return (
    <ProposalFormRoot
      properties={{
        reviewGroupName: "Launch council",
        submissionDisabled: false,
      }}
      resolver={zodResolver(proposalSchema)}
      defaultValues={PROPOSAL_DEFAULT_VALUES}
      mode="onBlur"
      onSubmit={submitProposal}
    >
      <ProposalDetails />
      <ProposalPreview />
      <ProposalSubmit />
    </ProposalFormRoot>
  )
}
