"use client"

import { useWatch } from "react-hook-form"

import {
  useProposalForm,
  useProposalFormProperties,
} from "../proposal-form"

export function ProposalPreview() {
  const form = useProposalForm()
  const reviewGroupName = useProposalFormProperties(
    (properties) => properties.reviewGroupName
  )
  const values = useWatch({ control: form.control })

  return (
    <aside aria-live="polite">
      <strong>{values.title || "Untitled proposal"}</strong>
      <p>{values.owner ? `Owned by ${values.owner}` : "No owner selected"}</p>
      <p>Reviewed by {reviewGroupName}</p>
    </aside>
  )
}
