import { describe, expect, it } from "vitest"

export type DecisionCase<Input, Result> = {
  case: string
  input: Input
  expected: Result
}

/** Runs one test per row against a named pure decision. The suite is named after the function. */
export function checkDecision<Input, Result>(
  decide: (input: Input) => Result,
  cases: readonly DecisionCase<Input, Result>[],
): void {
  if (!decide.name) {
    throw new Error("checkDecision needs a named function; its name is the suite name")
  }

  describe(decide.name, () => {
    it.each(cases)("$case", ({ input, expected }) => {
      expect(decide(input)).toEqual(expected)
    })
  })
}
