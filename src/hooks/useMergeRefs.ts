import { useMemo } from "react"

/**
 * Merges several refs (callback or object) into one callback ref, for a component that needs to
 * forward a ref while also keeping its own to the same node.
 *
 * @example
 * ```tsx
 * function Component({ ref: forwardedRef }) {
 *   const internalRef = useRef<HTMLDivElement>(null)
 *   const mergedRef = useMergeRefs([forwardedRef, internalRef])
 *
 *   return <div ref={mergedRef}>Content</div>
 * }
 * ```
 */
export function useMergeRefs<Instance>(
  refs: Array<React.Ref<Instance> | undefined>
): React.RefCallback<Instance> | null {
  return useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null
    }

    return value => {
      refs.forEach(ref => {
        if (typeof ref === "function") {
          ref(value)
        } else if (ref != null) {
          // eslint-disable-next-line no-param-reassign
          ref.current = value
        }
      })
    }
  }, [refs])
}
