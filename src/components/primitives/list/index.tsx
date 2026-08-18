/* eslint-disable react-refresh/only-export-components */
import { useRender } from "@base-ui/react"
import { cx } from "cva"
import type { ComponentProps, ReactNode } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = ComponentProps<"div">

/** A full-width row list: hairline-separated rows of title, description and meta. */
function Root({ children, className, ...rest }: RootProps) {
  return (
    <div {...rest} className={cx(styles.List, className)}>
      {children}
    </div>
  )
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = useRender.ComponentProps<"div"> & {
  /** Omit for rows whose main content is prose rather than a heading, and pass `children` instead. */
  title?: ReactNode
  description?: ReactNode
  /** Secondary content under the body, e.g. a date and a reading time. */
  footer?: ReactNode
  /** Turns on the hover, focus and trailing-arrow affordances. Set this on rows that navigate. */
  interactive?: boolean
  /** Extra content between the description and the footer, e.g. tags. */
  children?: ReactNode
}

function Item({ render, title, description, footer, interactive = false, children, className, ...rest }: ItemProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...rest,
      className: cx(styles.Item, interactive && styles["Item--interactive"], className),
      children: (
        <>
          <div className={styles.Item__main}>
            {title && (
              <Typography size="x-small" weight="medium" className={styles.Item__title}>
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

type MetaItemProps = ComponentProps<"span"> & {
  "data-tone"?: "danger" | "accent"
}

/** An icon paired with its value, keeping the two on one line. */
function MetaItem({ children, className, ...rest }: MetaItemProps) {
  return (
    <span {...rest} className={cx(styles.Item__metaItem, className)}>
      {children}
    </span>
  )
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
