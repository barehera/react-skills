import { Button } from "@/components/ui/button"
import type { Member } from "@/features/members/server-state/use-members-query"

import type { TaskFilters } from "../hooks/use-task-filters"
import type { TaskStatus } from "../types"

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

export function TaskFilterBar({
  filters,
  members,
  onToggleStatus,
  onAssigneeChange,
  onQueryChange,
}: {
  filters: TaskFilters
  members: Member[]
  onToggleStatus: (status: TaskStatus) => void
  onAssigneeChange: (assigneeId: string | null | undefined) => void
  onQueryChange: (query: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        aria-label="Search tasks"
        className="h-9 rounded-md border px-3 text-sm"
        value={filters.query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={
            filters.statuses.includes(option.value) ? "default" : "outline"
          }
          aria-pressed={filters.statuses.includes(option.value)}
          onClick={() => onToggleStatus(option.value)}
        >
          {option.label}
        </Button>
      ))}
      <select
        aria-label="Assignee"
        className="h-9 rounded-md border px-2 text-sm"
        value={
          filters.assigneeId === undefined
            ? "__any"
            : filters.assigneeId === null
              ? "__none"
              : filters.assigneeId
        }
        onChange={(event) => {
          const value = event.target.value
          if (value === "__any") {
            onAssigneeChange(undefined)
          } else if (value === "__none") {
            onAssigneeChange(null)
          } else {
            onAssigneeChange(value)
          }
        }}
      >
        <option value="__any">Any assignee</option>
        <option value="__none">Unassigned</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  )
}
