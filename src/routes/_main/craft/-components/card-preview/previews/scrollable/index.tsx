import { useEffect, useRef } from "react"

import { Scrollable } from "@/components/primitives/scrollable"

import styles from "./index.module.scss"

const ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/** How long a scroll to one end takes to reveal itself, in either direction. */
const CYCLE = 2200

/** Cycles the scroll position on its own, in a card meant to be tapped rather than scrolled: the
    box demonstrates itself instead of waiting for a pointer that would otherwise just click through. */
export default function ScrollablePreview() {
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    let goingDown = true
    const id = setInterval(() => {
      const max = viewport.scrollHeight - viewport.clientHeight
      viewport.scrollTo({ top: goingDown ? max : 0, behavior: "smooth" })
      goingDown = !goingDown
    }, CYCLE)

    return () => clearInterval(id)
  }, [])

  return (
    <Scrollable
      className={styles.Box}
      maxHeight={100}
      scrollbar="always"
      contentClassName={styles.List}
      contentRef={viewportRef}
      aria-hidden="true">
      {ROWS.map(day => (
        <span key={day} className={styles.List__row}>
          {day}
        </span>
      ))}
    </Scrollable>
  )
}
