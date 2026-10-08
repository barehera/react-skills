import { useState } from "react"

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuTrigger,
  type ActionMenuSize,
} from "@/components/ui/action-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useViewer } from "@/hooks/use-viewer"

import { canDeleteTask } from "../policy"
import { useDeleteTaskMutation } from "../server-state/mutations/use-delete-task-mutation"
import { useDuplicateTaskMutation } from "../server-state/mutations/use-duplicate-task-mutation"
import { useRenameTaskMutation } from "../server-state/mutations/use-rename-task-mutation"
import type { Task } from "../types"

export function TaskActions({
  task,
  size,
}: {
  task: Task
  size?: ActionMenuSize
}) {
  const viewer = useViewer()
  const rename = useRenameTaskMutation()
  const duplicate = useDuplicateTaskMutation()
  const remove = useDeleteTaskMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const canDelete = canDeleteTask(task, viewer)

  function renameTask() {
    const title = window.prompt("New title", task.title)?.trim()
    if (title) rename.mutate({ task, title })
  }

  return (
    <>
      <ActionMenu>
        <ActionMenuTrigger aria-label={`Actions for ${task.title}`} />
        <ActionMenuContent size={size} align="end">
          <ActionMenuItem disabled={rename.isPending} onSelect={renameTask}>
            Rename…
          </ActionMenuItem>
          <ActionMenuItem
            disabled={duplicate.isPending}
            onSelect={() => duplicate.mutate(task)}
          >
            Duplicate
          </ActionMenuItem>
          {canDelete && (
            <ActionMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              Delete…
            </ActionMenuItem>
          )}
        </ActionMenuContent>
      </ActionMenu>

      {canDelete && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Deleted tasks cannot be restored.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={remove.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  remove.mutate(task, {
                    onSuccess: () => setConfirmOpen(false),
                  })
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
