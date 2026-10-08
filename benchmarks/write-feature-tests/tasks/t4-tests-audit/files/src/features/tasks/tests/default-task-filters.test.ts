import { describe, expect, it } from "vitest"

import { DEFAULT_TASK_FILTERS } from "../filters"

describe("DEFAULT_TASK_FILTERS", () => {
  it("clears filters", () => {
    expect(DEFAULT_TASK_FILTERS).toEqual({ search: "", status: null, assigneeId: null, page: 1 })
  })
})
