import { testRule } from "../../../../tests/rule-cases"
import { canSubmit } from "../../submission"

testRule(canSubmit, [
  { case: "submits a valid idle form", input: { valid: true, saving: false }, expected: true },
  { case: "blocks a save already in flight", input: { valid: true, saving: true }, expected: false },
  { case: "blocks an invalid form", input: { valid: false, saving: false }, expected: false },
])
