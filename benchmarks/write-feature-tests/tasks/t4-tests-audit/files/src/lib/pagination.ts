/** Keeps a requested page inside 1..pageCount; an empty list still shows page 1. */
export function clampPage({ page, pageCount }: { page: number; pageCount: number }): number {
  if (pageCount < 1) return 1
  return Math.min(Math.max(1, Math.trunc(page)), pageCount)
}
