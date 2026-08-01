"use client"

import { Button } from "@/components/ui/button"

import { useProposalForm } from "../proposal-form"

export function ProposalSubmit() {
  const form = useProposalForm()

  return (
    <Button type="submit" disabled={form.formState.isSubmitting}>
      Submit proposal
    </Button>
  )
}
