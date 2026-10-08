import { Button } from "@/components/ui/button"
import {
  SelectionBar,
  SelectionBarActions,
  SelectionBarCount,
} from "@/components/ui/selection-bar"

import { useArchiveTasksMutation } from "../server-state/mutations/use-archive-tasks-mutation"

export function TaskBulkArchiveBar({
  projectId,
  selectedIds,
  onArchived,
}: {
  projectId: string
  selectedIds: string[]
  onArchived: () => void
}) {
  const archive = useArchiveTasksMutation()

  if (selectedIds.length === 0) return null

  return (
    <SelectionBar aria-label="Bulk task actions">
      <SelectionBarCount>{selectedIds.length} selected</SelectionBarCount>
      <SelectionBarActions>
        <Button
          size="sm"
          variant="outline"
          disabled={archive.isPending}
          onClick={() =>
            archive.mutate(
              { projectId, taskIds: selectedIds },
              { onSuccess: onArchived }
            )
          }
        >
          Archive
        </Button>
      </SelectionBarActions>
    </SelectionBar>
  )
}
