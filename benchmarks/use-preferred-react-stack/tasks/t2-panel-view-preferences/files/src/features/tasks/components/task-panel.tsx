import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { TaskList } from "./task-list"

export function TaskPanel({
  projectId,
  title,
}: {
  projectId: string
  title: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {/* TODO: view controls */}
      </CardHeader>
      <CardContent>
        <TaskList projectId={projectId} />
      </CardContent>
    </Card>
  )
}
