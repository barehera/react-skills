import { testRule } from "@/tests/rule-cases"

import { includesOption } from "../options"

// Reshapes includesOption into one object so it fits testRule.
function includesOptionCase({ options, value }: { options: readonly string[]; value: string }) {
  return includesOption(options, value)
}

testRule(includesOptionCase, [
  { case: "accepts a listed option", input: { options: ["a", "b"], value: "a" }, expected: true },
  { case: "rejects an unlisted value", input: { options: ["a", "b"], value: "c" }, expected: false },
  { case: "rejects an empty value", input: { options: ["a", "b"], value: "" }, expected: false },
])
