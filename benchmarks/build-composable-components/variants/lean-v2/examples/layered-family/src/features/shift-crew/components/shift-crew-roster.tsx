"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"

import {
  RosterItem,
  RosterLabel,
  RosterList,
  RosterMeta,
  RosterRoot,
  RosterToggle,
  type RosterSize,
} from "../../../components/roster"
import { useAssignShiftCrewMutation } from "../server-state/mutations/use-assign-shift-crew-mutation"
import { useShiftCrewQuery } from "../server-state/queries/use-shift-crew-query"
import type { CrewMember } from "../server-state/types"

type ShiftCrewRosterProps = {
  shiftId: string
  size?: RosterSize
}

export function ShiftCrewRoster({ shiftId, size }: ShiftCrewRosterProps) {
  const crewQuery = useShiftCrewQuery({ shiftId })
  const assignCrew = useAssignShiftCrewMutation({ shiftId })

  if (crewQuery.isPending) {
    return (
      <Empty>
        <EmptyTitle>Loading crew</EmptyTitle>
      </Empty>
    )
  }

  if (crewQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Crew unavailable</AlertTitle>
        <AlertDescription>{crewQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  const { members, assignedMemberIds } = crewQuery.data

  if (members.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No crew on file</EmptyTitle>
        <EmptyDescription>
          Add members before staffing this shift.
        </EmptyDescription>
      </Empty>
    )
  }

  const lockedLeadId = getLockedLeadId(members, assignedMemberIds)

  return (
    <RosterRoot
      size={size}
      value={assignedMemberIds}
      onValueChange={(memberIds) => assignCrew.mutate({ memberIds })}
    >
      <RosterList>
        {members.map((member) => (
          <RosterItem key={member.id} value={member.id}>
            <RosterToggle disabled={member.id === lockedLeadId} />
            <RosterLabel>{member.name}</RosterLabel>
            <RosterMeta>
              {member.role === "lead" ? "Shift lead" : "Crew"}
            </RosterMeta>
          </RosterItem>
        ))}
      </RosterList>
      {assignCrew.isError && (
        <Alert variant="destructive">
          <AlertTitle>Assignment not saved</AlertTitle>
          <AlertDescription>{assignCrew.error.message}</AlertDescription>
        </Alert>
      )}
    </RosterRoot>
  )
}

/**
 * Business Logic: Keep at least one shift lead assigned to every shift.
 * Why: Dispatch cannot publish a shift without an accountable lead on site.
 * Rule: Disable unassigning the last assigned lead instead of rejecting the save later.
 */
function getLockedLeadId(members: CrewMember[], assignedMemberIds: string[]) {
  const assignedLeads = members.filter(
    (member) => member.role === "lead" && assignedMemberIds.includes(member.id)
  )

  return assignedLeads.length === 1 ? assignedLeads[0].id : null
}
