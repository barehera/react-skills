import { describe, expect, it } from "vitest"

import { canDeleteTask } from "../policy"

describe("task policy", () => {
  it("lets owners delete any task", () => {
    expect(canDeleteTask({ role: "owner", isCreator: false })).toBe(true)
  })

  it("lets editors delete their own tasks", () => {
    expect(canDeleteTask({ role: "editor", isCreator: true })).toBe(true)
  })

  it("stops editors deleting tasks created by others", () => {
    expect(canDeleteTask({ role: "editor", isCreator: false })).toBe(false)
  })

  it("stops viewers deleting tasks", () => {
    expect(canDeleteTask({ role: "viewer", isCreator: true })).toBe(false)
  })
})
