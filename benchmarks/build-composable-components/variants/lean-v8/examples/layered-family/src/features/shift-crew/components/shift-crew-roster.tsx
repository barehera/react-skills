"use client"

import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Roster,
  RosterEmpty,
  RosterError,
  RosterItem,
  RosterLabel,
  RosterList,
  RosterLoading,
  RosterMeta,
  RosterToggle,
} from "../../../components/ui/roster"
import { useAssignShiftCrewMutation } from "../server-state/mutations/use-assign-shift-crew-mutation"
import { useShiftCrewQuery } from "../server-state/queries/use-shift-crew-query"
import type { CrewMember, ShiftCrew } from "../server-state/types"

const crewRoleLabel: Record<CrewMember["role"], string> = {
  lead: "Shift lead",
  crew: "Crew",
}

function ShiftCrewRoster({ shiftId }: { shiftId: string }) {
  const crewQuery = useShiftCrewQuery({ shiftId })
  const assignCrew = useAssignShiftCrewMutation({ shiftId })
  const lockedLeadId = crewQuery.data ? getLockedLeadId(crewQuery.data) : null

  return (
    <Roster
      value={crewQuery.data?.assignedMemberIds ?? []}
      onValueChange={(memberIds) => assignCrew.mutate({ memberIds })}
    >
      <section className="flex flex-col gap-2">
        <RosterList
          size="sm"
          aria-label="Shift crew"
          aria-busy={crewQuery.isPending}
        >
          {crewQuery.isPending && <RosterLoading>Loading crew…</RosterLoading>}
          {crewQuery.isError && (
            <RosterError>Crew unavailable: {crewQuery.error.message}</RosterError>
          )}
          {crewQuery.data?.members.length === 0 && (
            <RosterEmpty>No crew on file</RosterEmpty>
          )}
          {crewQuery.data?.members.map((member) => (
            <ShiftCrewRosterItem
              key={member.id}
              member={member}
              locked={member.id === lockedLeadId}
            />
          ))}
        </RosterList>
        {assignCrew.isError && (
          <Alert variant="destructive">
            <AlertTitle>Assignment not saved</AlertTitle>
            <AlertDescription>{assignCrew.error.message}</AlertDescription>
          </Alert>
        )}
      </section>
    </Roster>
  )
}

function ShiftCrewRosterItem({
  member,
  locked,
  ...props
}: Omit<React.ComponentProps<typeof RosterItem>, "value" | "children"> & {
  member: CrewMember
  locked: boolean
}) {
  return (
    <RosterItem {...props} value={member.id}>
      <RosterToggle disabled={locked} />
      <RosterLabel>{member.name}</RosterLabel>
      <RosterMeta>{crewRoleLabel[member.role]}</RosterMeta>
    </RosterItem>
  )
}

/**
 * Business Logic: Keep at least one shift lead assigned to every shift.
 * Why: Dispatch cannot publish a shift without an accountable lead on site.
 * Rule: Disable unassigning the last assigned lead instead of rejecting the save later.
 */
function getLockedLeadId({ members, assignedMemberIds }: ShiftCrew) {
  const assignedLeads = members.filter(
    (member) => member.role === "lead" && assignedMemberIds.includes(member.id)
  )

  return assignedLeads.length === 1 ? assignedLeads[0].id : null
}

export { ShiftCrewRoster, ShiftCrewRosterItem }
