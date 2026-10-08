import { useForm } from "react-hook-form"

import type { InviteValues } from "../types/invite"

export function InviteSummary() {
  const form = useForm<InviteValues>()
  const invitees = form.watch("invitees") ?? []
  const count = invitees.filter((invitee) => invitee.email).length

  return (
    <p className="text-sm text-muted-foreground">
      Inviting {count} {count === 1 ? "person" : "people"}
    </p>
  )
}
