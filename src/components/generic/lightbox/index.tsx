import { Dialog } from "@base-ui/react/dialog"
import { Image } from "@unpic/react"
import type { ReactNode } from "react"

import { useScopedTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

type LightboxProps = {
  children: ReactNode
  src: string
  alt?: string
}

export function Lightbox({ children, src, alt }: LightboxProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.Trigger} aria-label={alt ? `View ${alt}` : "View image"}>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Popup
          data-theme={useScopedTheme()}
          className={styles.Popup}
          render={<Image src={src} alt={alt ?? ""} layout="fullWidth" className={styles.Image} />}
        />
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export declare namespace Lightbox {
  export type Props = LightboxProps
}
