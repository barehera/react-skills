import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/features/tasks/components/task-list"

export function DashboardPage({ projectId }: { projectId: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: compact task list */}
          <TaskList projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  )
}
