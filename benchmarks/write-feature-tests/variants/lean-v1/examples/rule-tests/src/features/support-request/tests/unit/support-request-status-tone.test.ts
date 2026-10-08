import { testRule } from "../../../../tests/rule-cases"
import { SUPPORT_REQUEST_STATUS_TONE, type SupportRequestStatus } from "../../status"

// Only indexes the map, so the map keeps its input shape and the suite gets a name.
function supportRequestStatusTone(status: SupportRequestStatus) {
  return SUPPORT_REQUEST_STATUS_TONE[status]
}

testRule(supportRequestStatusTone, [
  { case: "a new request stays neutral", input: "open", expected: "neutral" },
  { case: "a request waiting on the customer asks for attention", input: "waiting-on-customer", expected: "warning" },
  { case: "a resolved request reads as done", input: "resolved", expected: "success" },
  { case: "an expired request can no longer be reopened", input: "expired", expected: "danger" },
])
