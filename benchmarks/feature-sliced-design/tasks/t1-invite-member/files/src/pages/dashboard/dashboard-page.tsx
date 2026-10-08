import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMembersQuery } from "@/features/members/server-state/use-members-query"
import { TaskList } from "@/features/tasks/components/task-list"

export function DashboardPage({ projectId }: { projectId: string }) {
  const membersQuery = useMembersQuery(projectId, "")

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList projectId={projectId} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {membersQuery.isPending && (
            <p className="text-sm text-muted-foreground">Loading members…</p>
          )}
          {membersQuery.isError && (
            <p className="text-sm text-destructive">Members unavailable</p>
          )}
          {membersQuery.isSuccess && (
            <ul className="divide-y rounded-lg border">
              {membersQuery.data.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-4 py-2">
                  <span className="flex-1 truncate text-sm">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
