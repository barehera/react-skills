import assert from "node:assert/strict"
import test from "node:test"
import { AxiosError } from "axios"
import { RateLimiter } from "@tanstack/react-pacer/rate-limiter"
import { Debouncer } from "@tanstack/react-pacer/debouncer"
import {
  hasCompletedInspection,
  toRestartedInspection,
  isInspectionCapacityError,
  createInspectionError,
} from "../skills/extract-named-helpers/examples/inspection.ts"
import { createPreferencesStore } from "../skills/use-preferred-react-stack/examples/preferences-store.ts"

test("completion preserves empty, incomplete, and zero timestamp boundaries", () => {
  assert.equal(hasCompletedInspection({ checks: [], completedAt: 0 }), false)
  assert.equal(hasCompletedInspection({ checks: [{ complete: false }], completedAt: 1 }), false)
  assert.equal(hasCompletedInspection({ checks: [{ complete: true }], completedAt: null }), false)
  assert.equal(hasCompletedInspection({ checks: [{ complete: true }], completedAt: 0 }), true)
})

test("restart transforms a copy without losing unrelated domain data", () => {
  const source = Object.freeze({ id: "inspection-1", notes: "Retain", completedAt: 1,
    checks: Object.freeze([Object.freeze({ complete: true })]) })
  const result = toRestartedInspection(source)
  assert.equal(result.completedAt, null)
  assert.equal(result.checks[0].complete, false)
  assert.equal(source.checks[0].complete, true)
  assert.equal(result.notes, source.notes)
  assert.notEqual(result.checks, source.checks)
})

test("shared error predicates handle HTTP, domain code, and malformed payloads", () => {
  const response = (status, data) => new AxiosError("Failure", undefined, undefined, undefined,
    { status, data, statusText: "Failure", headers: {}, config: {} })
  for (const error of [response(429, null), response(400, { code: "CAPACITY" }), response(400, { code: "CAPACITY_EXCEEDED" })]) {
    assert.equal(isInspectionCapacityError(error), true)
    assert.deepEqual(createInspectionError(error), { kind: "capacity" })
  }
  for (const error of [null, new Error("plain"), response(500, "bad"), response(500, null)]) {
    assert.equal(isInspectionCapacityError(error), false)
    assert.deepEqual(createInspectionError(error), { kind: "unexpected" })
  }
})

test("scoped preferences isolate memory, hydrate intentionally, and persist only data", async () => {
  const values = new Map()
  const storage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
  const first = createPreferencesStore(storage, "one")
  const second = createPreferencesStore(storage, "two")
  first.getState().setSortOrder("recent")
  assert.equal(second.getState().sortOrder, "name")
  assert.deepEqual(JSON.parse(values.get("one")).state, { sortOrder: "recent" })
  const reloaded = createPreferencesStore(storage, "one")
  assert.equal(reloaded.getState().sortOrder, "name")
  await reloaded.persist.rehydrate()
  assert.equal(reloaded.getState().sortOrder, "recent")
  reloaded.getState().reset()
  assert.equal(reloaded.getState().sortOrder, "name")
  assert.deepEqual(JSON.parse(values.get("one")).state, { sortOrder: "name" })
})

test("one limiter shares its execution budget across callers", context => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"] })
  const notices = []
  const limiter = new RateLimiter(value => notices.push(value),
    { limit: 1, window: 60_000, windowType: "sliding" })
  limiter.maybeExecute("first")
  limiter.maybeExecute("second")
  assert.deepEqual(notices, ["first"])
})

test("debounce retains latest input and cancellation discards pending work", context => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"] })
  const values = []
  const debouncer = new Debouncer(value => values.push(value), { wait: 400 })
  debouncer.maybeExecute("a")
  context.mock.timers.tick(200)
  debouncer.maybeExecute("ab")
  context.mock.timers.tick(399)
  assert.deepEqual(values, [])
  context.mock.timers.tick(1)
  assert.deepEqual(values, ["ab"])
  debouncer.maybeExecute("discard")
  debouncer.cancel()
  context.mock.timers.tick(400)
  assert.deepEqual(values, ["ab"])
})
