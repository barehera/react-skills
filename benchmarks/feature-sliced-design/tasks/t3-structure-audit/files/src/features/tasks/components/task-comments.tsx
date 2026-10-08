import { formatRelativeDate } from "@/lib/date/format-relative-date"
import { useTaskCommentsQuery } from "@/server-state/project-queries"

export function TaskComments({ taskId }: { taskId: string }) {
  const commentsQuery = useTaskCommentsQuery(taskId)

  if (!commentsQuery.data) return null

  return (
    <ul className="flex flex-col gap-3">
      {commentsQuery.data.map((comment) => (
        <li key={comment.id} className="text-sm">
          <span className="font-medium">{comment.authorName}</span>{" "}
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
          <p>{comment.body}</p>
        </li>
      ))}
    </ul>
  )
}
