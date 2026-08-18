import { Dialog } from "@base-ui/react/dialog"
import { cx } from "cva"
import type { ComponentProps } from "react"

import { Image } from "@/components/primitives/image"
import { useScopedTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

type LightboxProps = ComponentProps<typeof Dialog.Trigger> & {
  src: string
  alt?: string
}

export function Lightbox({ children, src, alt, className, ...rest }: LightboxProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={alt ? `View ${alt}` : "View image"}
        {...rest}
        className={cx(styles.Trigger, className)}>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        {/* The picture is a child rather than the popup's own `render`: the dialog has to own a
            plain element it can put its ref, its state attributes and its exit transition on, and
            `Image` is a frame around an `img` that would take those onto the wrong node — leaving
            nothing whose transition ends, so the popup would never unmount. */}
        <Dialog.Popup data-theme={useScopedTheme()} className={styles.Popup}>
          <Image src={src} alt={alt ?? ""} layout="intrinsic" className={styles.Image} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export declare namespace Lightbox {
  export type Props = LightboxProps
}
