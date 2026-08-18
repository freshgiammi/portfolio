import { Dialog } from "@base-ui/react/dialog"
import { motion } from "motion/react"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import { useScopedTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

type GalleryLightboxImage = {
  src: string
  alt?: string
  description?: string
}

type GalleryLightboxProps = Omit<Dialog.Root.Props, "children"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: Array<GalleryLightboxImage>
  initialIndex?: number
}

const SWIPE_THRESHOLD = 60

// Multi-image counterpart to `Lightbox` (@/components/ui/lightbox): same Dialog
// primitives, but with prev/next navigation and drag-to-swipe between images.
export function GalleryLightbox({ open, onOpenChange, images, initialIndex = 0, ...rest }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  // Reset to initialIndex each time the dialog transitions from closed to open, without an
  // effect (see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setIndex(initialIndex)
  }

  function go(delta: number) {
    setIndex(prev => (prev + delta + images.length) % images.length)
  }

  const image = images[index]
  const scopedTheme = useScopedTheme()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} {...rest}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Popup
          data-theme={scopedTheme}
          className={styles.Popup}
          aria-label="Image gallery"
          onClick={() => onOpenChange(false)}>
          <Dialog.Close className={styles.Close} aria-label="Close">
            <Icon.XIcon size={18} />
          </Dialog.Close>

          {images.length > 1 && (
            <button
              type="button"
              className={styles.Nav}
              data-side="left"
              onClick={event => {
                event.stopPropagation()
                go(-1)
              }}
              aria-label="Previous image">
              <Icon.CaretLeftIcon size={20} />
            </button>
          )}

          {image && (
            <motion.div
              key={index}
              className={styles.ImageWrap}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              dragMomentum={false}
              onDragEnd={(_, dragInfo) => {
                if (dragInfo.offset.x < -SWIPE_THRESHOLD) go(1)
                else if (dragInfo.offset.x > SWIPE_THRESHOLD) go(-1)
              }}
              onClick={event => {
                event.stopPropagation()
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}>
              <Image src={image.src} alt={image.alt ?? ""} layout="fill" className={styles.Image} draggable={false} />
            </motion.div>
          )}

          {image?.description && (
            <Typography size="x-small" weight="regular" className={styles.Description}>
              {image.description}
            </Typography>
          )}

          {images.length > 1 && (
            <button
              type="button"
              className={styles.Nav}
              data-side="right"
              onClick={event => {
                event.stopPropagation()
                go(1)
              }}
              aria-label="Next image">
              <Icon.CaretRightIcon size={20} />
            </button>
          )}

          {images.length > 1 && (
            <div className={styles.Dots}>
              {images.map((_, i) => (
                <span
                  // Static, never-reordered list, so an index key is safe here.
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={styles.Dot}
                  data-active={i === index || undefined}
                />
              ))}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export declare namespace GalleryLightbox {
  export type Props = GalleryLightboxProps
  export type Image = GalleryLightboxImage
}
