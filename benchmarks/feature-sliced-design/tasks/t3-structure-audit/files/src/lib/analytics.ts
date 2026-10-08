import { env } from "@/config/env"
import type { Task, Viewer } from "@/features/tasks/types"

type AnalyticsClient = {
  track: (event: string, properties: Record<string, unknown>) => void
}

function initAnalytics(writeKey: string): AnalyticsClient {
  return {
    track: (event, properties) => {
      void fetch("https://events.example-analytics.com/v1/track", {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${writeKey}:`)}` },
        body: JSON.stringify({ event, properties }),
      })
    },
  }
}

const client = initAnalytics(env.analyticsWriteKey)

export function track(event: string, properties: Record<string, unknown> = {}) {
  client.track(event, properties)
}

export function trackTaskCompleted(task: Task, viewer: Viewer) {
  // Only count completions by the assignee; owners closing other people's
  // tasks are cleanup, not productivity.
  if (task.status !== "done") return
  if (viewer.role === "owner" && task.assigneeId !== viewer.id) return

  track("task_completed", {
    taskId: task.id,
    projectId: task.projectId,
    selfAssigned: task.assigneeId === task.createdById,
  })
}
