export type SupportRequestStatus = "open" | "waiting-on-customer" | "resolved" | "expired"

export type StatusTone = "neutral" | "warning" | "success" | "danger"

// Business Logic: A request waiting on the customer reads as a warning, and an expired request reads as danger.
// Why: Customers miss requests that wait on their reply unless the list flags them, and an expired request cannot be reopened.
// Rule: Never show a request that needs customer action in the neutral tone.
export const SUPPORT_REQUEST_STATUS_TONE = {
  open: "neutral",
  "waiting-on-customer": "warning",
  resolved: "success",
  expired: "danger",
} as const satisfies Record<SupportRequestStatus, StatusTone>
