import { useVirtualizer } from "@tanstack/react-virtual"
import { useCallback, useRef, useState } from "react"

import { Scrollable } from "@/components/primitives/scrollable"
import type { Find } from "@/data/finds"
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect"

import { FindCard } from "../find-card"
import styles from "./index.module.scss"

/** `--spacing-md`, which the stylesheet spends as the flex gap and this has to count in a width. */
const GAP = 24

/** Card widths are a clamp in the stylesheet, so this only has to hold until the first is measured. */
const ESTIMATED_CARD_WIDTH = 352

/** Cards are cheap and a rail is short; a couple either side is enough to never see one arrive. */
const OVERSCAN = 2

type FindsRailProps = {
  finds: Array<Find>
}

/**
 * One tag's finds, as a rail you scroll sideways.
 *
 * Virtualized by spacers inside the normal flex row rather than by absolute positioning, so every
 * card still stretches to the height of the tallest one in the row.
 */
export function FindsRail({ finds }: FindsRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLAnchorElement | null>(null)
  const [cardWidth, setCardWidth] = useState(ESTIMATED_CARD_WIDTH)

  // Card width is a viewport clamp set in the stylesheet, so it's read off a rendered card rather
  // than recomputed here. All cards share the same width, so any one in view will do.
  const holdCard = useCallback((node: HTMLAnchorElement | null) => {
    if (!node) return
    cardRef.current = node
    setCardWidth(previous => node.offsetWidth || previous)
  }, [])

  // Card width is a viewport clamp, so it's stale after a resize or a zoom and needs remeasuring.
  useIsomorphicLayoutEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return undefined

    const observer = new ResizeObserver(() => {
      const card = cardRef.current
      if (card) setCardWidth(previous => card.offsetWidth || previous)
    })

    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  // react-virtual's returned object carries methods (measure, scrollToIndex, …) the compiler can't
  // prove are stable, so it always skips optimizing whatever function holds onto it; a known,
  // library-level incompatibility rather than something fixable here.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: finds.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => cardWidth + GAP,
    overscan: OVERSCAN
  })

  // Forces a remeasure since cardWidth changing (viewport resize) shifts every offset in the rail.
  useIsomorphicLayoutEffect(() => {
    virtualizer.measure()
  }, [virtualizer, cardWidth])

  const items = virtualizer.getVirtualItems()

  // Subtract GAP since the flex row already adds a gap around each spacer. Omit a spacer entirely
  // rather than render one at zero width.
  const before = (items.at(0)?.start ?? 0) - GAP
  const after = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0) - GAP

  return (
    <Scrollable scrollbar="always" contentClassName={styles.Rail} contentRef={scrollRef}>
      {before > 0 && <div className={styles.Rail__spacer} style={{ width: before }} />}

      {items.map((item, position) => {
        const find = finds[item.index]!

        return <FindCard key={find.id} find={find} ref={position === 0 ? holdCard : undefined} />
      })}

      {after > 0 && <div className={styles.Rail__spacer} style={{ width: after }} />}
    </Scrollable>
  )
}

export declare namespace FindsRail {
  export type Props = FindsRailProps
}
