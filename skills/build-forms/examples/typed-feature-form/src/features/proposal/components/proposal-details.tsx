"use client"

import {
  InputFieldControl,
  InputFieldDescription,
  InputFieldError,
  InputFieldLabel,
  InputFieldRoot,
} from "../../form/components/input-field"
import {
  SelectFieldContent,
  SelectFieldControl,
  SelectFieldDescription,
  SelectFieldError,
  SelectFieldItem,
  SelectFieldLabel,
  SelectFieldRoot,
  SelectFieldTrigger,
  SelectFieldValue,
} from "../../form/components/select-field"
import {
  PROPOSAL_SURFACES,
  useProposalForm,
} from "../proposal-form"

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

      <SelectFieldRoot control={form.control} name="surface">
        <SelectFieldLabel>Primary surface</SelectFieldLabel>
        <SelectFieldControl>
          <SelectFieldTrigger>
            <SelectFieldValue placeholder="Choose a surface" />
          </SelectFieldTrigger>
          <SelectFieldContent align="start">
            {PROPOSAL_SURFACES.map((surface) => (
              <SelectFieldItem key={surface.value} value={surface.value}>
                {surface.label}
              </SelectFieldItem>
            ))}
          </SelectFieldContent>
        </SelectFieldControl>
        <SelectFieldDescription>
          Choose where customers will encounter the proposal.
        </SelectFieldDescription>
        <SelectFieldError />
      </SelectFieldRoot>
    </section>
  )
}
