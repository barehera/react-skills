import { Button } from "@/components/ui/button"

import { useTaskForm } from "../task-form"

export function TaskFormActions() {
  const form = useTaskForm()

  return (
    <footer className="flex justify-end gap-2 border-t pt-4">
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save task"}
      </Button>
    </footer>
  )
}
