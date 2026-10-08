import { useFieldArray, type UseFormReturn } from "react-hook-form"

import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"

import type { InviteValues } from "../types/invite"

export function InviteeRows({ form }: { form: UseFormReturn<InviteValues> }) {
  const invitees = useFieldArray({ control: form.control, name: "invitees" })

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-sm font-medium">People</legend>
      {invitees.fields.map((field, index) => (
        <div key={index} className="flex items-end gap-2">
          <FormField
            form={form}
            name={`invitees.${index}.email`}
            label="Email"
            inputProps={{
              placeholder: "name@company.com",
              onBlur: () => track("invitee_email_blur", { row: index }),
            }}
          />
          <select
            aria-label="Role"
            className="h-9 rounded-md border px-2 text-sm"
            {...form.register(`invitees.${index}.role`)}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          {invitees.fields.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove person ${index + 1}`}
              onClick={() => invitees.remove(index)}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        variant="outline"
        className="justify-self-start"
        disabled={invitees.fields.length >= 10}
        onClick={() => invitees.append({ email: "", role: "editor" })}
      >
        Add another
      </Button>
    </fieldset>
  )
}
