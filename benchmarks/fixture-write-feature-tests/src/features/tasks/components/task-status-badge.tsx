import { TASK_STATUS_TONE } from "../status"
import type { TaskStatus } from "../types"

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span data-tone={TASK_STATUS_TONE[status]} className="rounded px-2 text-xs">
      {status.replace("_", " ")}
    </span>
  )
}
