import * as React from "react"

import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/features/tasks/types"

const statusText: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

function StatusBadge({
  status,
  ...props
}: React.ComponentProps<typeof Badge> & { status: TaskStatus }) {
  return (
    <Badge variant={status === "done" ? "default" : "secondary"} {...props}>
      {statusText[status]}
    </Badge>
  )
}

export { StatusBadge }
