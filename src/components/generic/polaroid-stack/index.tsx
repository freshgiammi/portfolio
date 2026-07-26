import { Image } from "@unpic/react"
import { motion } from "motion/react"
import { useRef, useState } from "react"
import type { StaticAssetPath } from "virtual:static-assets"
import { staticAssets } from "virtual:static-assets"

import { GalleryLightbox } from "@/components/generic/gallery-lightbox"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

type PolaroidStackProps = {
  photos: Array<PolaroidStackPhoto>
  initialTopIndex?: number
}

type ReorderDirection = "forward" | "backward"
type PolaroidStackPhoto = {
  src: StaticAssetPath
  caption: string
}

// Cycled per photo (not per stack position) so a given photo keeps its own tilt
// wherever it lands in the stack.
const ROTATIONS = [-4, 3, -6, 5]
const SEND_TO_BACK_DISTANCE = 90

function createInitialOrder(photoCount: number, initialTopIndex: number) {
  const indexes = Array.from({ length: photoCount }, (_, i) => i)
  if (photoCount === 0) return indexes
  const normalized = ((initialTopIndex % photoCount) + photoCount) % photoCount
  return [...indexes.slice(normalized), ...indexes.slice(0, normalized)]
}

export function PolaroidStack({ photos, initialTopIndex = 0 }: PolaroidStackProps) {
  const [order, setOrder] = useState<Array<number>>(() => createInitialOrder(photos.length, initialTopIndex))
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const didDragRef = useRef(false)
  const cardRefs = useRef<Record<number, HTMLElement | null>>({})

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

  const topIndex = order[0] ?? 0

  return (
    <>
      <div className={styles.Stack}>
        {order.map((photoIndex, stackPos) => {
          const photo = photos[photoIndex]
          if (!photo) return null
          const isTop = stackPos === 0
          const side = stackPos % 2 === 0 ? -1 : 1

          return (
            <motion.figure
              key={photoIndex}
              ref={element => {
                cardRefs.current[photoIndex] = element
              }}
              className={styles.Polaroid}
              initial={false}
              data-top={isTop || undefined}
              style={{ zIndex: photos.length - stackPos, rotate: ROTATIONS[photoIndex % ROTATIONS.length] }}
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
              }}>
              <Image
                src={staticAssets(photo.src)}
                alt=""
                layout="fullWidth"
                className={styles.Polaroid__image}
                draggable={false}
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
        images={photos.map(p => ({ src: staticAssets(p.src), alt: p.caption, description: p.caption }))}
        initialIndex={topIndex}
      />
    </>
  )
}

export declare namespace PolaroidStack {
  export type Props = PolaroidStackProps
  export type Photo = PolaroidStackPhoto
}
