import { loadDefaultAppConfig } from "../../../../config/app-config"
import { testRule } from "../../../../tests/rule-cases"
import { getAttachmentLimitMb } from "../../submission"

testRule(getAttachmentLimitMb, [
  { case: "keeps the fixed priority ceiling", input: "priority", expected: 50 },
  {
    case: "follows the configured standard limit",
    input: "standard",
    expected: loadDefaultAppConfig("supportRequest").maxAttachmentMb,
  },
])
