import {
  ActivityTimeline,
  type ActivityEntry,
} from "@/components/activity-timeline"

export function ProjectActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <ActivityTimeline
      title="Project activity"
      entries={entries}
      itemProps={{ className: "min-h-10 px-4 text-base" }}
    />
  )
}
