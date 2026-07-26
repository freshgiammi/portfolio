import { useEffect, useState } from "react"

import { Icon } from "@/components/ui/icons"

type ReadCountProps = {
  slug: string
  className?: string
  /** Rendered with the count, so a meta separator disappears along with an absent number. */
  separator?: React.ReactNode
}

/** How far down the page, and how long on it, before this counts as read rather than opened. */
const READ_RATIO = 0.5
const READ_DWELL_MS = 20_000

export function ReadCount({ slug, className, separator }: ReadCountProps) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    void requestCount(slug, { signal: controller.signal }).then(value => {
      if (value !== null) setCount(value)
    })

    return () => controller.abort()
  }, [slug])

  useEffect(() => {
    const key = `read:${slug}`
    if (alreadyCounted(key)) return undefined

    const openedAt = Date.now()
    let counted = false

    const check = () => {
      if (counted) return

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 1
      if (ratio < READ_RATIO || Date.now() - openedAt < READ_DWELL_MS) return

      counted = true
      markCounted(key)
      void requestCount(slug, { method: "POST" }).then(value => {
        if (value !== null) setCount(value)
      })
    }

    // Scroll alone would miss a reader who passes the halfway point before the dwell elapses, so
    // the timer re-checks once the clock catches up.
    const timer = setTimeout(check, READ_DWELL_MS)
    window.addEventListener("scroll", check, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", check)
    }
  }, [slug])

  if (count === null || count === 0) return null

  const label = `${count.toLocaleString()} ${count === 1 ? "read" : "reads"}`

  return (
    <>
      {separator}
      <span className={className}>
        <Icon.EyeIcon size={12} />
        {label}
      </span>
    </>
  )
}

export declare namespace ReadCount {
  export type Props = ReadCountProps
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/** `null` for every failure: a missing count renders as nothing rather than as an error. */
async function requestCount(slug: string, init?: RequestInit): Promise<number | null> {
  try {
    const response = await fetch(`/api/reads/${slug}`, init)
    if (!response.ok) return null

    const data = (await response.json()) as { count?: unknown }
    return typeof data.count === "number" ? data.count : null
  } catch {
    return null
  }
}

/**
 * Deduping is per session and client side, so a reload does not count twice and nothing about the
 * reader has to be stored server side.
 */
function alreadyCounted(key: string) {
  try {
    return sessionStorage.getItem(key) !== null
  } catch {
    // Storage can be blocked outright; counting twice beats not counting at all.
    return false
  }
}

function markCounted(key: string) {
  try {
    sessionStorage.setItem(key, "1")
  } catch {
    // Same as above: the count still goes through.
  }
}
