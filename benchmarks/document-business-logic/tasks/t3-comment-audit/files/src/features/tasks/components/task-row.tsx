/*
 * Copyright (c) 2026 Acme Inc. All rights reserved.
 * Licensed under the Acme Commercial License. See LICENSE in the project root.
 */
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useViewer } from "@/hooks/use-viewer"
import { cn } from "@/lib/utils"

import { canDeleteTask } from "../policy"
import type { Task, TaskStatus } from "../types"

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

/**
 * Business Logic: Tell whether a status is done.
 * Why: Done rows need to know that they are done.
 * Rule: Keep this equal to status === "done".
 */
const isDoneStatus = (status: TaskStatus) => status === "done"

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

export type TaskRowProps = {
  task: Task
  /**
   * Called with the task after the user confirms deletion. The row never
   * deletes by itself; the caller owns the mutation and its error handling.
   */
  onDelete: (task: Task) => void
  autoFocusDelete?: boolean
}

export function TaskRow({ task, onDelete, autoFocusDelete }: TaskRowProps) {
  // get the viewer
  const viewer = useViewer()

  // We used to show the delete button for everyone, then ACME-212 (March 2025)
  // moved it behind the policy. Before that this lived in TaskList and was
  // copied into the old dashboard. Keep the policy call until the old dashboard
  // is migrated, then we can maybe inline it again.
  //
  // ok so this part is important!!! dont remove. we had a bug where people
  // deleted a task while someone was working on it and the timer kept running in
  // the other tab and then the PATCH 404'd and the hours were gone. so now we
  // check in_progress here too. talk to Dana before changing anything.
  const canDelete = canDeleteTask(task, viewer) && task.status !== "in_progress"

  function handleDelete() {
    // window.confirm blocks the event loop, so onDelete only runs after the
    // dialog closes and the click event has finished bubbling
    if (window.confirm(`Delete "${task.title}"?`)) {
      onDelete(task)
    }
  }

  return (
    // Done rows get opacity-60 so users don't click them, because the click
    // handler fires twice in Safari while the opacity transition is running.
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-2 transition-opacity",
        isDoneStatus(task.status) && "opacity-60"
      )}
    >
      {/* Screen readers hear the status before the title, matching the visual order in the row. */}
      <span className="sr-only">{statusLabel[task.status]}:</span>
      <span className="flex-1 truncate text-sm">{task.title}</span>
      <Badge variant="secondary" aria-hidden>
        {statusLabel[task.status]}
      </Badge>
      {/* <Button size="sm" variant="ghost" onClick={() => onDuplicate(task)}>Duplicate</Button> */}
      {canDelete && (
        // eslint-disable-next-line jsx-a11y/no-autofocus -- focus moves here after "Undo" closes, per the keyboard spec
        <Button size="sm" variant="ghost" autoFocus={autoFocusDelete} onClick={handleDelete}>
          Delete
        </Button>
      )}
    </li>
  )
}
