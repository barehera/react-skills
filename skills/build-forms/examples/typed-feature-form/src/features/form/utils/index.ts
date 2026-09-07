import type { Ref } from "react"

const setRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === "function") return ref(value)
  if (ref) ref.current = value
  return undefined
}

export const composeRefs = <T,>(
  ...refs: (Ref<T> | undefined)[]
) => {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => setRef(ref, node))

    return () => {
      for (let index = 0; index < cleanups.length; index += 1) {
        const cleanup = cleanups[index]

        if (typeof cleanup === "function") {
          cleanup()
        } else {
          setRef(refs[index], null)
        }
      }
    }
  }
}
