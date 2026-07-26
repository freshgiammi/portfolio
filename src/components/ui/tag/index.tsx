/* eslint-disable react-refresh/only-export-components */
import { cx } from "cva"
import type { ReactNode } from "react"

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

/** A small uppercase mono pill, used for showcase and thought labels. */
function Root({ children, className }: RootProps) {
  return (
    <Typography size="xxx-small" family="mono" render={<span />} className={cx(styles.Tag, className)}>
      {children}
    </Typography>
  )
}

/*
 * ====================================================================================
 * List
 * ====================================================================================
 */

type ListProps = {
  tags: Array<string>
  className?: string
}

function List({ tags, className }: ListProps) {
  if (tags.length === 0) return null

  return (
    <div className={cx(styles.TagList, className)}>
      {tags.map(tag => (
        <Root key={tag}>{tag}</Root>
      ))}
    </div>
  )
}

export const Tag = {
  Root,
  List
}

// Merged into the parts object so each part carries its own types: `Tag.List.Props`.
export declare namespace Tag {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace List {
    export type Props = ListProps
  }
}
