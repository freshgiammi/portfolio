import { useEffect, useLayoutEffect } from "react"

/**
 * useLayoutEffect runs before the browser paints, so client-only corrections made inside it
 * never become visible as a flash. On the server it would just warn and no-op, so fall back
 * to useEffect there.
 */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect
