import * as React from "react"

import { Button } from "@/components/ui/button"
import { TASK_SEARCH_DEBOUNCE_MS } from "@/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useTaskFilters } from "@/hooks/use-task-filters"
import type { TaskStatusFilter } from "@/types/task-filter"

const statusOptions: { value: TaskStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

export function TaskFilterBar() {
  const status = useTaskFilters((state) => state.status)
  const setStatus = useTaskFilters((state) => state.setStatus)
  const setSearch = useTaskFilters((state) => state.setSearch)
  const [draft, setDraft] = React.useState("")
  const debouncedDraft = useDebouncedValue(draft, TASK_SEARCH_DEBOUNCE_MS)

  React.useEffect(() => {
    setSearch(debouncedDraft)
  }, [debouncedDraft, setSearch])

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label="Search tasks"
        className="h-9 flex-1 rounded-md border px-3 text-sm"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={status === option.value ? "default" : "outline"}
          onClick={() => setStatus(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
