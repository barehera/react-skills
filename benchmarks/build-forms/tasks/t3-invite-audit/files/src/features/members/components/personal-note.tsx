import type { UseFormReturn } from "react-hook-form"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

import type { InviteValues } from "../types/invite"

export function PersonalNote({ form }: { form: UseFormReturn<InviteValues> }) {
  const includeNote = form.watch("includeNote")

  return (
    <div className="grid gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("includeNote")} />
        Add a personal note
      </label>
      {includeNote ? (
        <Field>
          <FieldLabel htmlFor="invite-note">Note</FieldLabel>
          <Textarea
            id="invite-note"
            rows={3}
            aria-describedby="invite-note-description"
            {...form.register("note", { shouldUnregister: true })}
          />
          <FieldDescription id="invite-note-description">
            Shown at the top of the invitation email.
          </FieldDescription>
        </Field>
      ) : null}
    </div>
  )
}
