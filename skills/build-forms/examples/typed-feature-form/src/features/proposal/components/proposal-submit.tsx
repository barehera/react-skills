"use client"

import { Button } from "@/components/ui/button"

import {
  useProposalForm,
  useProposalFormProperties,
} from "../proposal-form"

export function ProposalSubmit() {
  const form = useProposalForm()
  const submissionDisabled = useProposalFormProperties(
    (properties) => properties.submissionDisabled
  )

  return (
    <Button
      type="submit"
      disabled={submissionDisabled || form.formState.isSubmitting}
    >
      Submit proposal
    </Button>
  )
}
