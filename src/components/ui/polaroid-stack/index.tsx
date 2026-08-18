import { cx } from "cva"
import { motion } from "motion/react"
import type { ComponentProps } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import { GalleryLightbox } from "@/components/ui/gallery-lightbox"

import styles from "./index.module.scss"

type PolaroidStackOrientation = "horizontal" | "vertical"

type PolaroidStackProps = ComponentProps<"div"> & {
  photos: Array<PolaroidStackPhoto>
  /** Shape of the photographs in the stack, so the card is cut for them. */
  orientation?: PolaroidStackOrientation
  initialTopIndex?: number
  /**
   * Milliseconds between the stack dealing itself the next photo, for a stack nobody is going to
   * touch. Left out, it waits to be dragged like every other one.
   */
  cycleEvery?: number
}

type ReorderDirection = "forward" | "backward"
type PolaroidStackPhoto = { src: string; caption: string }

// Seeded pseudo-random in [0, 1). Two different seeds give a base rotation and a jitter that are
// independent yet both stable for the same photo index.
function hash(seed: number, salt: number): number {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const SEND_TO_BACK_DISTANCE = 90

/**
 * How many cards from the top actually mount. Past this depth a card is scaled down and shoved far
 * enough off-centre that it reads as gone rather than as a sliver of the next photo, so there is
 * nothing lost in not rendering it — only DOM nodes, refs, and a `motion.figure` instance saved on a
 * stack that outgrows a handful of photos.
 *
 * The one behaviour this trades away: cycling backward past this depth pulls in a card that was not
 * previously mounted, so it pops into place at the top rather than animating in from the back like a
 * card that was already rendered mid-stack. Only reachable once a stack holds more photos than this,
 * which none of this component's current callers do.
 */
const RENDER_WINDOW = 10

/**
 * How many of those rendered cards skip the lazy-loading default. Kept well under `RENDER_WINDOW`:
 * a card ten deep is real DOM (so a reorder can reach it without a mount flash) but is a third of its
 * full size and mostly covered, so it is not worth fetching before the browser is asked to.
 */
const EAGER_WINDOW = 3

function createInitialOrder(photoCount: number, initialTopIndex: number) {
  const indexes = Array.from({ length: photoCount }, (_, i) => i)
  if (photoCount === 0) return indexes
  const normalized = ((initialTopIndex % photoCount) + photoCount) % photoCount
  return [...indexes.slice(normalized), ...indexes.slice(0, normalized)]
}

export function PolaroidStack({
  photos,
  orientation = "vertical",
  initialTopIndex = 0,
  cycleEvery,
  className,
  ...rest
}: PolaroidStackProps) {
  const [order, setOrder] = useState<Array<number>>(() => createInitialOrder(photos.length, initialTopIndex))
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const didDragRef = useRef(false)
  const cardRefs = useRef<Record<number, HTMLElement | null>>({})

  // Base rotation ± a small jitter, both deterministic per photo so a card keeps its tilt wherever
  // it lands, and memoised so the values don't shift when the order array changes.
  const rotations = useMemo(
    () =>
      photos.map((_, i) => {
        const base = (hash(i, 0) * 2 - 1) * 8
        const jitter = (hash(i, 1) * 2 - 1) * 2
        return Math.round(base + jitter)
      }),
    [photos]
  )
  function focusCard(photoIndex: number | undefined) {
    if (photoIndex === undefined) return
    requestAnimationFrame(() => {
      cardRefs.current[photoIndex]?.focus()
    })
  }

  function reorderStack(direction: ReorderDirection, focusTopCard = false, photoIndex?: number) {
    setOrder(prev => {
      let next = prev

      if (direction === "forward" && photoIndex !== undefined) {
        next = [...prev.filter(i => i !== photoIndex), photoIndex]
      }

      if (direction === "backward") {
        const last = prev[prev.length - 1]
        if (last !== undefined) next = [last, ...prev.slice(0, -1)]
      }

      if (focusTopCard) focusCard(next[0])
      return next
    })
  }

  // A stack that deals itself, for the places where it is a picture of the component rather than the
  // component: a thumbnail nobody can drag has nothing to show unless it moves on its own. Stopped
  // where motion is unwelcome, and while the tab is in the background, where it would be animating
  // to nobody.
  useEffect(() => {
    if (!cycleEvery || photos.length < 2) return undefined
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined

    let timer: number | undefined

    const tick = () => {
      // The same move a drag makes, said as a rotation so the timer never has to know which photo
      // is on top: taking it from the order itself would mean restarting on every deal.
      if (!document.hidden) setOrder(prev => (prev.length > 1 ? [...prev.slice(1), prev[0]!] : prev))
      timer = window.setTimeout(tick, cycleEvery)
    }

    timer = window.setTimeout(tick, cycleEvery)
    return () => window.clearTimeout(timer)
  }, [cycleEvery, photos.length])

  const topIndex = order[0] ?? 0

  return (
    <>
      <div {...rest} data-orientation={orientation} className={cx(styles.Stack, className)}>
        {order.slice(0, RENDER_WINDOW).map((photoIndex, stackPos) => {
          const photo = photos[photoIndex]
          if (!photo) return null
          const isTop = stackPos === 0
          const side = stackPos % 2 === 0 ? -1 : 1
          const eager = stackPos < EAGER_WINDOW

          return (
            <motion.figure
              key={photoIndex}
              className={styles.Polaroid}
              initial={false}
              data-top={isTop || undefined}
              style={{ zIndex: photos.length - stackPos, rotate: rotations[photoIndex] }}
              animate={{
                scale: 1 - stackPos * 0.045,
                x: side * stackPos * 6,
                y: stackPos * 10
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              drag={isTop}
              dragMomentum={false}
              // The top card's `animate` target is already {x: 0, y: 0}, so a drag that ends
              // without reordering the stack leaves the prop unchanged and gives Motion nothing
              // to re-run. This springs the card home regardless.
              dragSnapToOrigin
              onContextMenu={event => {
                if (isTop) event.preventDefault()
              }}
              onPointerDown={() => {
                didDragRef.current = false
              }}
              onDragStart={() => {
                didDragRef.current = true
              }}
              onDragEnd={(_event, dragInfo) => {
                const distance = Math.hypot(dragInfo.offset.x, dragInfo.offset.y)
                if (distance > SEND_TO_BACK_DISTANCE) reorderStack("forward", false, photoIndex)
              }}
              onClick={event => {
                if (!isTop) return
                if (event.detail === 0 || !didDragRef.current) setLightboxOpen(true)
              }}
              role={isTop ? "button" : undefined}
              tabIndex={isTop ? 0 : -1}
              aria-label={isTop ? `View ${photo.caption}` : undefined}
              aria-keyshortcuts={isTop ? "Enter Space ArrowRight ArrowDown ArrowLeft ArrowUp" : undefined}
              onKeyDown={event => {
                if (!isTop) return

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setLightboxOpen(true)
                  return
                }

                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault()
                  reorderStack("forward", true, photoIndex)
                  return
                }

                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault()
                  reorderStack("backward", true)
                }
              }}
              ref={element => {
                cardRefs.current[photoIndex] = element
              }}>
              <Image
                src={photo.src}
                alt=""
                className={styles.Polaroid__image}
                draggable={false}
                // The first EAGER_WINDOW cards are on screen at roughly the same rendered size the
                // moment the stack mounts — the ones peeking out are barely scaled down from the top
                // one — so Chrome's LCP candidate isn't reliably the top card specifically. All of
                // them skip the lazy-loading default the rest of the site's images use; deeper cards,
                // mounted for a smooth reorder but not for first paint, keep it.
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : undefined}
              />
              <Typography render={<figcaption />} size="xx-small" family="serif" className={styles.Polaroid__caption}>
                {photo.caption}
              </Typography>
            </motion.figure>
          )
        })}
      </div>

      <GalleryLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        // The caption doubles as the lightbox description, so a photo reads the same on the card
        // as it does blown up.
        images={photos.map((photo: PolaroidStackPhoto) => ({
          src: photo.src,
          alt: photo.caption,
          description: photo.caption
        }))}
        initialIndex={topIndex}
      />
    </>
  )
}

export declare namespace PolaroidStack {
  export type Props = PolaroidStackProps
  export type Photo = PolaroidStackPhoto
  export type Orientation = PolaroidStackOrientation
}
