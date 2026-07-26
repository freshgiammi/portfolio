import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import { formatRelativeTime } from "@/utils/date"

import styles from "./index.module.scss"

type LatestActivityProps = Record<string, never>

type Activity = {
  /** Reads as "<action> <repo>", e.g. "reviewed a pull request in arduino/cbor-js". */
  action: string
  repo: string
  at: string
  url: string
}

const ACTIVITY_KEY = ["activity"] as const

/** A stable empty array, so a render with no data does not look like new data. */
const EMPTY: Array<Activity> = []

const ROTATION_MS = 4500

/** Matches the spring the polaroid stack uses, so the two hero elements move the same way. */
const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const

/**
 * Recent public GitHub activity, one line at a time, rotating on a timer.
 *
 * Hovering or focusing pauses the rotation, because a line that slides away mid-read is a line you
 * cannot click. The dots on the right say how many there are and which one this is.
 */
export function LatestActivity(_props: LatestActivityProps) {
  const { data: activity = EMPTY } = useQuery({ queryKey: ACTIVITY_KEY, queryFn: fetchActivity })
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const index = useRotation(activity.length, ROTATION_MS, paused)
  const current = activity[index]

  if (!current) return null

  return (
    <Typography
      size="x-small"
      className={styles.LatestActivity}
      render={
        <a
          href={current.url}
          target="_blank"
          rel="noreferrer noopener"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        />
      }>
      <Icon.GithubLogoIcon size={13} className={styles.LatestActivity__icon} />

      {/* popLayout, so the outgoing line leaves the flow and the incoming one does not wait for it. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current.at}
          className={styles.LatestActivity__line}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={reduceMotion ? { duration: 0.15 } : SPRING}>
          <span className={styles.LatestActivity__action}>{current.action}</span>
          <span className={styles.LatestActivity__repo}>{current.repo}</span>
          <time dateTime={current.at} className={styles.LatestActivity__time}>
            {formatRelativeTime(current.at, { style: "narrow" })}
          </time>
        </motion.span>
      </AnimatePresence>

      {activity.length > 1 && (
        <span className={styles.LatestActivity__dots} aria-hidden="true">
          {activity.map((item, itemIndex) => (
            <motion.span
              key={item.at}
              className={styles.LatestActivity__dot}
              animate={{ opacity: itemIndex === index ? 1 : 0.35 }}
              transition={{ duration: 0.2 }}
              data-active={itemIndex === index || undefined}
            />
          ))}
        </span>
      )}
    </Typography>
  )
}

export declare namespace LatestActivity {
  export type Props = LatestActivityProps
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/**
 * Fetched on the client rather than in a loader, and not only to keep the render cheap: the labels are
 * relative to now, so a server that rendered "2 hours ago" would hand the browser a string that is
 * already stale. The signal comes from the query, which cancels the request if this unmounts first.
 */
async function fetchActivity({ signal }: { signal: AbortSignal }): Promise<Array<Activity>> {
  const response = await fetch("/api/activity", { signal })
  if (!response.ok) throw new Error(`Activity lookup failed: ${response.status}`)

  const payload = (await response.json()) as { activity?: Array<Activity> }
  return payload.activity ?? EMPTY
}

/** Steps through the list on a timer, holding still while `paused`. */
function useRotation(length: number, intervalMs: number, paused: boolean) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (length <= 1 || paused) return undefined

    const timer = setInterval(() => setIndex(current => (current + 1) % length), intervalMs)
    return () => clearInterval(timer)
  }, [length, intervalMs, paused])

  return Math.min(index, Math.max(length - 1, 0))
}
