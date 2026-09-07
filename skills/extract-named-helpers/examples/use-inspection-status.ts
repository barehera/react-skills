import { useEffect } from "react"
import { hasCompletedInspection, type Inspection } from "./inspection"

type Status = "idle" | "saving" | "syncing" | "uploading"
const BUSY_STATUSES: readonly Status[] = ["saving", "syncing", "uploading"]

function isBusyStatus(status: Status): boolean {
  return BUSY_STATUSES.includes(status)
}

export function useInspectionStatus({
  inspection, status, pendingId, isOwner, setStatus,
}: {
  inspection: Inspection
  status: Status
  pendingId: string | null
  isOwner: boolean
  setStatus: (status: Status) => void
}) {
  const isWaiting = isBusyStatus(status)
  const canPublish = isOwner && !isWaiting && hasCompletedInspection(inspection)

  useEffect(() => {
    if (!pendingId && isBusyStatus(status)) setStatus("idle")
  }, [pendingId, status, setStatus])

  return { isWaiting, canPublish }
}
