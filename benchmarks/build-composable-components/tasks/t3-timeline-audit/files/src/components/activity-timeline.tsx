import * as React from "react"
import { create } from "zustand"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ActivityEntry = {
  id: string
  actor: string
  message: string
  occurredAt: string
  details?: string
}

type TimelineVariant = "default" | "compact"
type TimelineLayout = "list" | "grouped"

type TimelineStore = {
  expandedId: string | null
  setExpandedId: (id: string | null) => void
}

const useTimelineStore = create<TimelineStore>((set) => ({
  expandedId: null,
  setExpandedId: (expandedId) => set({ expandedId }),
}))

type ActivityTimelineContextValue = {
  title: string
  titleId: string
  variant: TimelineVariant
  entries: ActivityEntry[]
}

const ActivityTimelineContext =
  React.createContext<ActivityTimelineContextValue | null>(null)

export function useActivityTimeline() {
  const context = React.useContext(ActivityTimelineContext)

  if (!context) {
    throw new Error("useActivityTimeline must be used inside ActivityTimeline.")
  }

  return context
}

export function getTimelineEntryDomId(entryId: string) {
  return `activity-entry-${entryId}`
}

export function __timelineItemsForTest(entries: ActivityEntry[]) {
  return entries.map((entry, index) => ({ ...entry, position: index + 1 }))
}

type ActivityTimelineProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string
  entries: ActivityEntry[]
  variant?: TimelineVariant
  layout?: TimelineLayout
  headerProps?: React.ComponentProps<"header">
  itemProps?: React.ComponentProps<"li">
}

export function ActivityTimeline({
  title,
  entries,
  variant = "default",
  layout = "list",
  headerProps,
  itemProps,
  className,
  children,
  ...props
}: ActivityTimelineProps) {
  const titleId = React.useId()

  return (
    <ActivityTimelineContext.Provider
      value={{ title, titleId, variant, entries }}
    >
      <section
        aria-labelledby={titleId}
        data-variant={variant}
        className={cn("group/timeline flex flex-col gap-3", className)}
        {...props}
      >
        <header {...headerProps}>
          <ActivityTimelineTitle />
        </header>
        {layout === "grouped" ? <GroupedEntries itemProps={itemProps} /> : null}
        {layout === "list" ? (
          <ol className="flex flex-col gap-2">
            {entries.map((entry, index) => (
              <ActivityTimelineItem
                key={entry.id}
                entry={entry}
                index={index}
                {...itemProps}
              />
            ))}
          </ol>
        ) : null}
        {children}
      </section>
    </ActivityTimelineContext.Provider>
  )
}

export function ActivityTimelineTitle(props: React.ComponentProps<"h3">) {
  const { title, titleId } = useActivityTimeline()

  return (
    <h3 id={titleId} className="text-sm font-semibold" {...props}>
      {title}
    </h3>
  )
}

type ActivityTimelineItemProps = React.ComponentProps<"li"> & {
  entry: ActivityEntry
  index: number
}

function ActivityTimelineItem({
  entry,
  index,
  className,
  ...props
}: ActivityTimelineItemProps) {
  const expandedId = useTimelineStore((state) => state.expandedId)
  const setExpandedId = useTimelineStore((state) => state.setExpandedId)
  const expanded = expandedId === entry.id

  return (
    <li
      id={getTimelineEntryDomId(entry.id)}
      className={cn(
        "flex flex-col gap-1 rounded-md border p-3 group-data-[variant=compact]/timeline:p-2",
        className
      )}
      {...props}
    >
      <ActivityTimelinePosition index={index} />
      <p className="text-sm">
        <strong>{entry.actor}</strong> {entry.message}
      </p>
      {entry.details ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setExpandedId(expanded ? null : entry.id)}
        >
          {expanded ? "Hide details" : "Show details"}
        </Button>
      ) : null}
      {expanded ? (
        <p className="text-xs text-muted-foreground">{entry.details}</p>
      ) : null}
    </li>
  )
}

export function ActivityTimelinePosition({ index }: { index: number }) {
  const { entries } = useActivityTimeline()

  return (
    <span className="text-xs text-muted-foreground">
      {index + 1} / {entries.length}
    </span>
  )
}

function GroupedEntries({
  itemProps,
}: {
  itemProps?: React.ComponentProps<"li">
}) {
  const { entries } = useActivityTimeline()
  const days = Array.from(
    new Set(entries.map((entry) => entry.occurredAt.slice(0, 10)))
  )

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day}>
          <p className="text-xs font-medium">{day}</p>
          <ol className="flex flex-col gap-2">
            {entries
              .filter((entry) => entry.occurredAt.startsWith(day))
              .map((entry) => (
                <ActivityTimelineItem
                  key={entry.id}
                  entry={entry}
                  index={entries.indexOf(entry)}
                  {...itemProps}
                />
              ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
