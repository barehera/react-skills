import { describe, expect, it } from "vitest"

export type RuleCase<Input, Result> = {
  case: string
  input: Input
  expected: Result
}

export function testRule<Input, Result>(
  decide: (input: Input) => Result,
  cases: readonly RuleCase<Input, Result>[],
): void {
  if (!decide.name) {
    throw new Error("testRule needs a named decision function; its name is the suite name")
  }

  describe(decide.name, () => {
    it.each(cases)("$case", ({ input, expected }) => {
      expect(decide(input)).toEqual(expected)
    })
  })
}
