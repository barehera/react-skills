import { testRule } from "@/tests/rule-cases"

import { getSubtaskLimit } from "../subtasks"

testRule(getSubtaskLimit, [
  { case: "keeps the contractual enterprise ceiling", input: "enterprise", expected: 500 },
  { case: "a team workspace gets the standard limit", input: "team", expected: 20 },
  { case: "a free workspace gets the standard limit", input: "free", expected: 20 },
])
