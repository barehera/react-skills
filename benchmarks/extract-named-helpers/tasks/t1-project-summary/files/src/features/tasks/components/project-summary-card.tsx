import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useViewer } from "@/hooks/use-viewer"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"

export function ProjectSummaryCard({
  projectId,
  onArchive,
}: {
  projectId: string
  onArchive: () => void
}) {
  const viewer = useViewer()
  const tasksQuery = useTasksQuery(projectId)
  const tasks = tasksQuery.data ?? []

  // check if the viewer is the owner
  const isOwner = viewer.role === "owner"

  // count the done tasks
  const doneCount = tasks.filter((task) => task.status === "done").length

  // work out the percentage, 0 when there are no tasks
  let percentComplete = 0
  if (tasks.length > 0) {
    percentComplete = Math.round((doneCount / tasks.length) * 100)
  }

  // get today's date as YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10)

  // overdue = not done, has a due date, and the due date is before today
  const overdueCount = tasks.filter(
    (task) =>
      task.status !== "done" && task.dueDate !== null && task.dueDate < today
  ).length

  // find the next due date: open tasks with a due date, sorted, first one from today on
  const nextDueDate = tasks
    .filter((task) => task.status !== "done" && task.dueDate !== null)
    .map((task) => task.dueDate as string)
    .sort()
    .find((day) => day >= today)

  // Owners may archive only a project that has tasks and all of them are done.
  // New projects start empty, and archiving one by accident hides it from
  // everyone's sidebar (support ticket SUP-88).
  const canArchive =
    isOwner &&
    tasks.length > 0 &&
    tasks.every((task) => task.status === "done")

  // show the empty message when loaded and there are no tasks
  const showEmpty = !tasksQuery.isPending && tasks.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project progress</CardTitle>
        <CardDescription>
          {doneCount} of {tasks.length} tasks done ({percentComplete}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm">
        {showEmpty && <p className="text-muted-foreground">No tasks yet.</p>}
        {overdueCount > 0 && (
          <p className="text-destructive">{overdueCount} overdue</p>
        )}
        {nextDueDate !== undefined && <p>Next due {nextDueDate}</p>}
      </CardContent>
      {canArchive && (
        <CardFooter>
          <Button variant="outline" onClick={onArchive}>
            Archive project
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
