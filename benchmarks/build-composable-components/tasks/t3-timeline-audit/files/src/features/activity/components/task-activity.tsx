import {
  ActivityTimeline,
  type ActivityEntry,
} from "@/components/activity-timeline"

export function TaskActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <ActivityTimeline
      title="Task history"
      entries={entries}
      headerProps={{ className: "px-4" }}
      itemProps={{ className: "min-h-10 px-4 text-base" }}
    />
  )
}
