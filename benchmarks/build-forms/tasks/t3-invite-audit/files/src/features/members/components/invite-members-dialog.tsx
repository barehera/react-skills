import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { DialogForm } from "@/components/dialog-form"
import { ApiError } from "@/lib/api"

import { inviteSchema } from "../schemas/invite-schema"
import { useInviteMembersMutation } from "../server-state/use-invite-members-mutation"
import type { InviteValues } from "../types/invite"
import { InviteSummary } from "./invite-summary"
import { InviteeRows } from "./invitee-rows"
import { PersonalNote } from "./personal-note"

type InviteMembersDialogProps = {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMembersDialog({
  projectId,
  open,
  onOpenChange,
}: InviteMembersDialogProps) {
  const inviteMembers = useInviteMembersMutation()
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invitees: [{ email: "", role: "editor" }],
      includeNote: false,
      note: "",
    },
    mode: "onBlur",
  })

  async function sendInvites(values: InviteValues) {
    setSubmitError(null)

    const emails = values.invitees.map((invitee) => invitee.email.toLowerCase())
    if (new Set(emails).size !== emails.length) {
      window.alert("Each person can only be invited once.")
      return
    }

    try {
      await inviteMembers.mutateAsync({
        projectId,
        invitees: values.invitees,
        note: values.note,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSubmitError("Some of these people are already members.")
        return
      }
      setSubmitError("We couldn't send the invites. Try again.")
    }
  }

  return (
    <DialogForm
      open={open}
      onOpenChange={onOpenChange}
      title="Invite people"
      description="They get an email with a link to join this project."
      submitLabel="Send invites"
      pending={inviteMembers.isPending}
      onSubmit={form.handleSubmit(sendInvites)}
    >
      {submitError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </div>
      ) : null}
      <InviteeRows form={form} />
      <PersonalNote form={form} />
      <InviteSummary />
    </DialogForm>
  )
}
