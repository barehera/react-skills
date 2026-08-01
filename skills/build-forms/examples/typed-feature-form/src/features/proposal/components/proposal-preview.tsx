"use client"

import { useWatch } from "react-hook-form"

import { useProposalForm } from "../proposal-form"

export function ProposalPreview() {
  const form = useProposalForm()
  const values = useWatch({ control: form.control })

  return (
    <aside aria-live="polite">
      <strong>{values.title || "Untitled proposal"}</strong>
      <p>{values.owner ? `Owned by ${values.owner}` : "No owner selected"}</p>
    </aside>
  )
}
