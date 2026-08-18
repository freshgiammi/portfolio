import { cx } from "cva"
import type { ComponentProps, ReactNode } from "react"

import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

type TagProps = ComponentProps<"span"> & {
  /** A feedback colour to tint the tag with; left off, it stays neutral. */
  tone?: "info" | "success" | "important" | "warning" | "danger"
  size?: "small" | "medium" | "large"
  icon?: ReactNode
}

const fontMap: Record<NonNullable<TagProps["size"]>, Typography.Props["size"]> = {
  small: "xxx-small",
  medium: "xx-small",
  large: "x-small"
}

/** A small uppercase mono pill, used for showcase and thought labels. Placement — a row of them,
    spacing, where it sits in a header — is the consumer's to arrange around it. */
export function Tag({ tone, size = "small", icon, children, className, ...rest }: TagProps) {
  return (
    <Typography
      size={fontMap[size]}
      family="mono"
      render={<span {...rest} />}
      data-tone={tone}
      className={cx(styles.Tag, className)}>
      {icon && <span className={styles.Tag__icon}>{icon}</span>}
      {children}
    </Typography>
  )
}

export declare namespace Tag {
  export type Props = TagProps
}
