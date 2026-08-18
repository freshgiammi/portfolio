/* eslint-disable react-refresh/only-export-components */
import { cx } from "cva"
import type { ComponentProps, ReactNode } from "react"

import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = ComponentProps<"div"> & {
  /** Vertical rhythm between the page's direct children. */
  gap?: "lg" | "2xl"
  /** Narrow caps the measure for pages whose content reads best in a single column. */
  width?: "regular" | "narrow"
}

/** The page shell: centred, capped and padded, with one shared gap for its sections. */
function Root({ gap = "lg", width = "regular", children, className, ...rest }: RootProps) {
  return (
    <div {...rest} data-gap={gap} data-width={width} className={cx(styles.Root, className)}>
      {children}
    </div>
  )
}

/*
 * ====================================================================================
 * Content
 * ====================================================================================
 */

type ContentProps = ComponentProps<"div">

/** The page's body below the header, keeping the root's rhythm inside itself. */
function Content({ children, className, ...rest }: ContentProps) {
  return (
    <div {...rest} className={cx(styles.Content, className)}>
      {children}
    </div>
  )
}

/*
 * ====================================================================================
 * Header
 * ====================================================================================
 */

type HeaderProps = ComponentProps<"header"> & {
  emoji?: string
  title: ReactNode
  subtitle?: ReactNode
  /** A quiet line under the subtitle, e.g. cross-links to sibling pages or RSS. */
  aside?: ReactNode
  /** Right-hand content on the same row as the intro, e.g. layout tabs. */
  trailing?: ReactNode
}

function Header({ emoji, title, subtitle, aside, trailing, children, className, ...rest }: HeaderProps) {
  return (
    <header {...rest} className={cx(styles.Header, className)}>
      <div className={styles.Header__intro}>
        <Typography size="x-large" family="serif" className={styles.Header__title}>
          {emoji ? `${emoji} ${title}` : title}
        </Typography>
        {subtitle && (
          <Typography size="xx-small" weight="regular" className={styles.Header__subtitle}>
            {subtitle}
          </Typography>
        )}
        {aside && (
          <Typography size="xx-small" weight="regular" className={styles.Header__aside}>
            {aside}
          </Typography>
        )}
        {children}
      </div>
      {trailing}
    </header>
  )
}

export const Page = {
  Root,
  Content,
  Header
}

// Merged into the parts object so each part carries its own types: `Page.Header.Props`.
export declare namespace Page {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace Content {
    export type Props = ContentProps
  }
  export namespace Header {
    export type Props = HeaderProps
  }
}
