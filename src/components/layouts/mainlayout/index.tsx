import { cx } from "cva"
import type { ComponentProps } from "react"

import { Appearance } from "./-components/appearance"
import { Breadcrumb } from "./-components/breadcrumb"
import { Footer } from "./-components/footer"
import styles from "./index.module.scss"

type MainLayoutProps = ComponentProps<"div">

export function MainLayout({ children, className, ...rest }: MainLayoutProps) {
  return (
    <div {...rest} className={cx(styles.Layout, className)}>
      <div className={styles.HeaderBlur} aria-hidden="true" />

      <div className={styles.Header}>
        <Breadcrumb />

        <div className={styles.Header__actions}>
          <Appearance />
        </div>
      </div>

      <div className={styles.Layout__content}>{children}</div>

      <Footer />
    </div>
  )
}

export declare namespace MainLayout {
  export type Props = MainLayoutProps
}
