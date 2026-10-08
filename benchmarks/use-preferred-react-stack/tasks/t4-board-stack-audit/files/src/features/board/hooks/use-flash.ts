import { useEffect, useState } from "react"

/** Shows a short confirmation state (e.g. "Copied") that turns itself off. */
export function useFlash(durationMs = 1500) {
  const [isFlashing, setFlashing] = useState(false)

  useEffect(() => {
    if (!isFlashing) return
    const timeout = setTimeout(() => setFlashing(false), durationMs)
    return () => clearTimeout(timeout)
  }, [isFlashing, durationMs])

  return [isFlashing, () => setFlashing(true)] as const
}
