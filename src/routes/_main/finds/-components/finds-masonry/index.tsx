import { useWindowVirtualizer } from "@tanstack/react-virtual"
import type { CSSProperties, PointerEvent } from "react"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import { FIND_TILE_ASPECT_RATIO, FindTile } from "@/components/ui/find-tile"
import { FINDS } from "@/data/finds"
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect"

import styles from "./index.module.scss"

/** The narrowest a column is allowed to get before the grid drops one, and the most it will draw. */
const COLUMN_MIN_WIDTH = 320
const MAX_COLUMNS = 3

/** Shared with the stylesheet through `--gap`, because the virtualizer has to do the arithmetic. */
const GAP = 24

type Layout = { columns: number; tileHeight: number; scrollMargin: number }

/** Stands in for the one render there is no container to measure yet, and draws nothing. */
const UNMEASURED: Layout = { columns: 1, tileHeight: 0, scrollMargin: 0 }

/**
 * The whole feed as one grid, virtualized so only the part on screen actually renders.
 *
 * Every tile has a fixed aspect ratio, so its height follows from its column width and the total
 * feed height follows from that — the page is its final scroll height from the first frame, rather
 * than growing as tiles load.
 */
export function FindsMasonry() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ columns, tileHeight, scrollMargin }, setLayout] = useState<Layout>(UNMEASURED)

  // Measured synchronously up front (not left to the resize observer's first callback, which lands a
  // frame late) since the window virtualizer counts scroll from the top of the document and needs to
  // know where this grid starts.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const measure = () => {
      const width = container.clientWidth
      const fits = Math.floor((width + GAP) / (COLUMN_MIN_WIDTH + GAP))
      const nextColumns = Math.min(Math.max(fits, 1), MAX_COLUMNS)

      setLayout(previous => {
        const next = {
          columns: nextColumns,
          tileHeight: (width - (nextColumns - 1) * GAP) / nextColumns / FIND_TILE_ASPECT_RATIO,
          scrollMargin: container.getBoundingClientRect().top + window.scrollY
        }
        return previous.columns === next.columns &&
          previous.tileHeight === next.tileHeight &&
          previous.scrollMargin === next.scrollMargin
          ? previous
          : next
      })
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const virtualizer = useWindowVirtualizer({
    // Zero until measured, so it never renders a frame of tiles sized for a wrong fallback column count.
    count: tileHeight > 0 ? FINDS.length : 0,
    estimateSize: () => tileHeight,
    overscan: 8,
    lanes: columns,
    gap: GAP,
    scrollMargin
  })

  // The virtualizer caches offsets, so a resize (the only thing that moves columns/tileHeight) has to
  // force a remeasure or tiles stay placed at their old height.
  useIsomorphicLayoutEffect(() => {
    virtualizer.measure()
  }, [virtualizer, columns, tileHeight])

  return (
    <div className={styles.Masonry}>
      <div
        className={styles.Masonry__canvas}
        style={
          {
            height: tileHeight > 0 ? virtualizer.getTotalSize() : undefined,
            "--columns": columns,
            "--gap": `${GAP}px`
          } as CSSProperties
        }
        ref={containerRef}>
        {tileHeight > 0 ? (
          virtualizer.getVirtualItems().map(item => {
            const find = FINDS[item.index]!

            return (
              <div
                key={find.id}
                className={styles.Masonry__item}
                style={
                  { "--lane": item.lane, transform: `translateY(${item.start - scrollMargin}px)` } as CSSProperties
                }>
                <FindTile find={find} eager={item.index < columns} />
              </div>
            )
          })
        ) : (
          // Nothing has been measured yet — server included, since a layout effect never runs there.
          // A plain grid needs no measurement to lay out a fixed-aspect tile, so the same row the
          // virtualizer would eventually place first is real markup from the first byte: a real
          // `<img>` the preload scanner can find, rather than an empty canvas waiting on hydration.
          <div className={styles.Masonry__staticRow}>
            {FINDS.slice(0, MAX_COLUMNS).map(find => (
              <FindTile key={find.id} find={find} eager />
            ))}
          </div>
        )}
      </div>

      {/* Held back until the grid has its real height: rendered any earlier, it sits right under the
          header on the unmeasured zero-height canvas and then jumps down once measurement lands —
          a layout shift the marker itself was causing. */}
      {tileHeight > 0 && <EdgeOfTheMap />}
    </div>
  )
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

/**
 * Replays the sweep animation on hover by rewinding it, since a finished CSS animation stays applied
 * and re-triggering the same one is a no-op for the browser. Skips one already mid-arc, and seeks
 * past the initial delay so the replay doesn't wait the way the first arrival did.
 */
function replaySweep(event: PointerEvent<SVGSVGElement>) {
  for (const animation of event.currentTarget.getAnimations()) {
    if (!(animation instanceof CSSAnimation)) continue
    if (animation.playState === "running") return

    animation.currentTime = animation.effect?.getComputedTiming().delay ?? 0
    animation.play()
  }
}

/** End-of-feed marker: the binoculars icon sweeps once when it actually scrolls into view. */
function EdgeOfTheMap() {
  const ref = useRef<HTMLDivElement>(null)
  const [reached, setReached] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setReached(true)
        // Fires once; replaying on every pass down the page would turn the arrival into wallpaper.
        observer.disconnect()
      },
      { threshold: 0.6 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.Edge} data-reached={reached || undefined} ref={ref}>
      <Icon.BinocularsIcon
        size={30}
        weight="duotone"
        className={styles.Edge__icon}
        aria-hidden="true"
        onPointerEnter={replaySweep}
      />
      <Typography size="small" family="serif" className={styles.Edge__title}>
        <em>Nothing left to find.</em>
      </Typography>
      <Typography size="xx-small" weight="regular" className={styles.Edge__note}>
        That&apos;s all {FINDS.length}. Check back when curiosity strikes again.
      </Typography>
    </div>
  )
}
