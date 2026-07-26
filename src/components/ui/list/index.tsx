/* eslint-disable react-refresh/only-export-components */
import { useRender } from "@base-ui/react"
import { cx } from "cva"
import type { ReactNode } from "react"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = {
  children: ReactNode
  className?: string
}

/** A full-width row list: hairline-separated rows of title, description and meta. */
function Root({ children, className }: RootProps) {
  return <div className={cx(styles.List, className)}>{children}</div>
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = {
  /** Renders the row as another element, e.g. a router `<Link>` or an `<article>`. */
  render?: useRender.ComponentProps<"div">["render"]
  /** Omit for rows whose main content is prose rather than a heading, and pass `children` instead. */
  title?: ReactNode
  description?: ReactNode
  /** Secondary content under the body, e.g. a date and a reading time. */
  footer?: ReactNode
  /** Turns on the hover, focus and trailing-arrow affordances. Set this on rows that navigate. */
  interactive?: boolean
  /** Extra content between the description and the footer, e.g. tags. */
  children?: ReactNode
  className?: string
}

function Item(props: ItemProps) {
  const { render, title, description, footer, interactive = false, children, className } = props

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      className: cx(styles.Item, interactive && styles["Item--interactive"], className),
      children: (
        <>
          <div className={styles.Item__main}>
            {title && (
              <Typography size="small" weight="medium" className={styles.Item__title}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography size="xx-small" weight="regular" className={styles.Item__description}>
                {description}
              </Typography>
            )}
            {children}
            {footer && (
              <Typography size="xx-small" weight="regular" className={styles.Item__footer}>
                {footer}
              </Typography>
            )}
          </div>
          {interactive && <Icon.ArrowRightIcon size={12} className={styles.Item__arrow} />}
        </>
      )
    }
  })
}

/*
 * ====================================================================================
 * MetaItem
 * ====================================================================================
 */

type MetaItemProps = {
  children: ReactNode
}

/** An icon paired with its value, keeping the two on one line. */
function MetaItem({ children }: MetaItemProps) {
  return <span className={styles.Item__metaItem}>{children}</span>
}

export const List = {
  Root,
  Item,
  MetaItem
}

// Merged into the parts object so each part carries its own types: `List.Item.Props`.
export declare namespace List {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace Item {
    export type Props = ItemProps
  }
  export namespace MetaItem {
    export type Props = MetaItemProps
  }
}
