import type * as React from "react"

import { Button } from "@/components/ui/button"

type RequestStatus = "waiting" | "ready" | "submitting"

type ConfirmationActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "disabled" | "onClick"
> & {
  onConfirm: () => void
  status: RequestStatus
}

/**
 * Business Logic: Let users confirm a pending request only when it is ready.
 * Why: The product may show the decision before it is valid to submit.
 * Rule: Keep Confirm disabled until the request reaches the ready state.
 */
export function ConfirmationAction({
  onConfirm,
  status,
  ...props
}: ConfirmationActionProps) {
  const isReady = status === "ready"

  return (
    <Button {...props} disabled={!isReady} onClick={onConfirm}>
      Confirm
    </Button>
  )
}
