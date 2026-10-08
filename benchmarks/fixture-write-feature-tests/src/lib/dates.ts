const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days from `from` to `to`, both ISO dates (YYYY-MM-DD). Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)
}
