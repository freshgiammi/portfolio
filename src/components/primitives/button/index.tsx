import { useRender } from "@base-ui/react"
import { cx } from "cva"
import type { ReactNode } from "react"

import { Typography } from "@/components/primitives/typography"
import { getTypographyAttributes } from "@/utils/typography"

import styles from "./index.module.scss"

type ButtonProps = useRender.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "tertiary"
  behaviour?: "default" | "danger" | "neutral"
  size?: "small" | "medium" | "large"
  icon?: ReactNode
}

const fontMap: Record<NonNullable<ButtonProps["size"]>, Typography.Props["size"]> = {
  small: "xx-small",
  medium: "x-small",
  large: "small"
}

/** The one button, shared so it stays the least interesting thing on the page. */
export function Button({
  variant = "primary",
  behaviour = "default",
  size = "medium",
  icon,
  children,
  className,
  type = "button",
  render,
  ...rest
}: ButtonProps) {
  const iconOnly = icon != null && children == null

  return useRender({
    defaultTagName: "button",
    render,
    props: {
      type,
      "data-variant": variant,
      "data-behaviour": behaviour === "default" ? undefined : behaviour,
      "data-size": size,
      "data-icon-only": iconOnly || undefined,
      ...getTypographyAttributes({ size: fontMap[size], family: "sans", weight: "medium" }),
      className: cx(styles.Button, className),
      children: (
        <>
          {icon && <span className={styles.Button__icon}>{icon}</span>}
          {children != null && <Typography>{children}</Typography>}
        </>
      ),
      ...rest
    }
  })
}

export declare namespace Button {
  export type Props = ButtonProps
}
