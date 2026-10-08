import { Badge } from "@/components/ui/badge"
import { useViewer } from "@/hooks/use-viewer"

import { canEditTask } from "../policy"
import type { Task } from "../types"

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  // get the current user from context
  const viewer = useViewer()
  // check if the user can edit
  const canEdit = canEditTask(viewer)

  // IMPORTANT (read this before touching!!): unassigned tasks don't render the
  // assignee initials. Originally we showed "??" but QA complained, then in v1.3
  // we tried a gray circle and it looked broken in dark mode because of the
  // bg-muted class, so now we render nothing there. Product (PRD-31) says
  // unassigned tasks must show the "Needs owner" badge instead, so triage can
  // find work that nobody owns. Don't change this without asking Priya.
  const needsOwner = task.assigneeId === null

  return (
    <article className="flex flex-col gap-2 rounded-lg border p-4">
      {/* title */}
      <h3 className="text-sm font-medium">{task.title}</h3>
      {/* flex row with a gap so the badges don't touch */}
      <div className="flex items-center gap-2">
        {/* The badge text is its accessible name; do not swap it for an icon-only badge. */}
        {needsOwner && <Badge variant="outline">Needs owner</Badge>}
      </div>
      {/* TODO actions (canEdit: {String(canEdit)}) */}
    </article>
  )
}
