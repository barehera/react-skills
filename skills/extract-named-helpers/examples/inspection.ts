import { isAxiosError } from "axios"

export type Inspection = {
  id: string
  checks: readonly { complete: boolean }[]
  completedAt: number | null
  notes: string
}

type CompletionSource = Pick<Inspection, "checks" | "completedAt">

export function hasCompletedInspection(source: CompletionSource): boolean {
  return source.completedAt !== null && source.checks.length > 0 &&
    source.checks.every(check => check.complete)
}

export function toRestartedInspection(source: Inspection): Inspection {
  return {
    ...source,
    completedAt: null,
    checks: source.checks.map(check => ({ ...check, complete: false })),
  }
}

function hasCapacityCode(error: unknown): boolean {
  if (!isAxiosError<unknown>(error)) return false
  const data = error.response?.data
  return typeof data === "object" && data !== null && "code" in data &&
    (data.code === "CAPACITY" || data.code === "CAPACITY_EXCEEDED")
}

function isTooManyRequests(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 429
}

export function isInspectionCapacityError(error: unknown): boolean {
  return hasCapacityCode(error) || isTooManyRequests(error)
}

export function createInspectionError(error: unknown): { kind: "capacity" | "unexpected" } {
  return { kind: isInspectionCapacityError(error) ? "capacity" : "unexpected" }
}
