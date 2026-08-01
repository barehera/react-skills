"use client"

import { useProposalForm } from "../proposal-form"

export function ProposalSubmit() {
  const form = useProposalForm()

  return (
    <button type="submit" disabled={form.formState.isSubmitting}>
      Submit proposal
    </button>
  )
}
