"use client"

import { useWatch } from "react-hook-form"

import {
  InputField,
  InputFieldControl,
  InputFieldDescription,
  InputFieldError,
  InputFieldLabel,
  InputFieldRoot,
} from "@/components/ui/input-field"
import { SelectField } from "@/components/ui/select-field"
import {
  PROPOSAL_SURFACES,
  PROPOSAL_TITLE_MAX_LENGTH,
  useProposalForm,
} from "../proposal-form"

export function ProposalDetails() {
  const form = useProposalForm()

  return (
    <section aria-labelledby="proposal-details-title">
      <h2 id="proposal-details-title">Proposal details</h2>

      {/* The counter shares the label row, so this field composes the slots. */}
      <InputFieldRoot control={form.control} name="title">
        <div className="flex items-baseline justify-between gap-2">
          <InputFieldLabel>Title (required)</InputFieldLabel>
          <ProposalTitleLength />
        </div>
        <InputFieldControl
          required
          maxLength={PROPOSAL_TITLE_MAX_LENGTH}
          placeholder="Returns automation pilot"
        />
        <InputFieldDescription>
          Use the name collaborators will see in planning.
        </InputFieldDescription>
        <InputFieldError />
      </InputFieldRoot>

      <InputField
        control={form.control}
        name="owner"
        label="Owner (required)"
        required
        autoCapitalize="words"
        autoComplete="name"
      />

      <SelectField
        control={form.control}
        name="surface"
        label="Primary surface (required)"
        description="Choose where customers will encounter the proposal."
        required
        options={PROPOSAL_SURFACES}
        placeholder="Choose a surface"
        slotProps={{ selectContent: { align: "start" } }}
      />
    </section>
  )
}

function ProposalTitleLength() {
  const form = useProposalForm()
  const title = useWatch({ control: form.control, name: "title" })

  return (
    <span aria-hidden="true">
      {title.length}/{PROPOSAL_TITLE_MAX_LENGTH}
    </span>
  )
}
