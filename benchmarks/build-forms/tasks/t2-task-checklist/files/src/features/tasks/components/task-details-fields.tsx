import {
  InputFieldControl,
  InputFieldError,
  InputFieldLabel,
  InputFieldRoot,
} from "@/features/form/components/input-field"
import {
  SelectFieldContent,
  SelectFieldControl,
  SelectFieldError,
  SelectFieldItem,
  SelectFieldLabel,
  SelectFieldRoot,
  SelectFieldTrigger,
  SelectFieldValue,
} from "@/features/form/components/select-field"

import { TASK_STATUSES, useTaskForm } from "../task-form"

export function TaskDetailsFields() {
  const form = useTaskForm()

  return (
    <section aria-labelledby="task-details-title" className="grid gap-6">
      <h2 id="task-details-title" className="text-base font-semibold">
        Details
      </h2>

      <InputFieldRoot control={form.control} name="title">
        <InputFieldLabel>Title</InputFieldLabel>
        <InputFieldControl required maxLength={120} />
        <InputFieldError />
      </InputFieldRoot>

      <SelectFieldRoot control={form.control} name="status">
        <SelectFieldLabel>Status</SelectFieldLabel>
        <SelectFieldControl required>
          <SelectFieldTrigger className="w-48">
            <SelectFieldValue />
          </SelectFieldTrigger>
          <SelectFieldContent align="start">
            {TASK_STATUSES.map((status) => (
              <SelectFieldItem key={status.value} value={status.value}>
                {status.label}
              </SelectFieldItem>
            ))}
          </SelectFieldContent>
        </SelectFieldControl>
        <SelectFieldError />
      </SelectFieldRoot>
    </section>
  )
}
