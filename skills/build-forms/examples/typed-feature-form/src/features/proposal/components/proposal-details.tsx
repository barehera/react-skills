"use client"

import {
  InputFieldControl,
  InputFieldDescription,
  InputFieldError,
  InputFieldLabel,
  InputFieldRoot,
} from "../../form/components/input-field"
import { useProposalForm } from "../proposal-form"

export function ProposalDetails() {
  const form = useProposalForm()

  return (
    <section aria-labelledby="proposal-details-title">
      <h2 id="proposal-details-title">Proposal details</h2>

      <InputFieldRoot control={form.control} name="title">
        <InputFieldLabel>Title</InputFieldLabel>
        <InputFieldControl placeholder="Returns automation pilot" />
        <InputFieldDescription>
          Use the name collaborators will see in planning.
        </InputFieldDescription>
        <InputFieldError />
      </InputFieldRoot>

      <InputFieldRoot control={form.control} name="owner">
        <InputFieldLabel>Owner</InputFieldLabel>
        <InputFieldControl autoComplete="name" />
        <InputFieldError />
      </InputFieldRoot>
    </section>
  )
}
