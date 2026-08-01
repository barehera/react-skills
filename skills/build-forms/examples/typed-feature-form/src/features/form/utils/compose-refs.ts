import * as React from "react"

export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
      return undefined
    })

    return () => {
      for (const cleanup of cleanups) {
        if (typeof cleanup === "function") cleanup()
      }
    }
  }
}
