import { describe, expect, it } from "vitest"

import { __timelineItemsForTest } from "./activity-timeline"

describe("activity timeline", () => {
  it("numbers entries from one", () => {
    const items = __timelineItemsForTest([
      { id: "a", actor: "Ada", message: "created the task", occurredAt: "2026-10-01T09:00:00Z" },
      { id: "b", actor: "Lin", message: "moved it to Done", occurredAt: "2026-10-02T10:00:00Z" },
    ])

    expect(items.map((item) => item.position)).toEqual([1, 2])
  })
})
