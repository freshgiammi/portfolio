/* eslint-disable react-refresh/only-export-components */
import { useRender } from "@base-ui/react"
import { cx } from "cva"
import type { ReactNode } from "react"

import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Menu
 * ====================================================================================
 *
 * The look of a menu, with none of its behaviour. Every part takes a `render` element and only
 * contributes classes and type styles to it, so the same surface can be driven by whichever Base
 * UI component suits the interaction: `Menu` for click-to-open, `NavigationMenu` for hover.
 *
 * Nothing here is exported to a page. Compose it into a component that owns the behaviour.
 */

type RenderProp = useRender.ComponentProps<"div">["render"]

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = {
  render?: RenderProp
  children?: ReactNode
  className?: string
}

function Popup({ render, children, className }: PopupProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: { className: cx(styles.Menu__popup, className), children }
  })
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = {
  render?: RenderProp
  /** Sits before the label at a fixed width, so labels line up whether or not one is present. */
  icon?: ReactNode
  /** Trailing slot, for a check mark or similar. */
  indicator?: ReactNode
  children?: ReactNode
  className?: string
}

function Item({ render, icon, indicator, children, className }: ItemProps) {
  return (
    <Typography size="x-small" render={render ?? <div />} className={cx(styles.Menu__item, className)}>
      {icon && <span className={styles.Menu__itemIcon}>{icon}</span>}
      <span className={styles.Menu__itemLabel}>{children}</span>
      {indicator && <span className={styles.Menu__itemIndicator}>{indicator}</span>}
    </Typography>
  )
}

/*
 * ====================================================================================
 * GroupLabel
 * ====================================================================================
 */

type GroupLabelProps = {
  render?: RenderProp
  children?: ReactNode
  className?: string
}

function GroupLabel({ render, children, className }: GroupLabelProps) {
  return (
    <Typography
      size="xx-small"
      weight="semibold"
      render={render ?? <div />}
      className={cx(styles.Menu__groupLabel, className)}>
      {children}
    </Typography>
  )
}

/*
 * ====================================================================================
 * Separator
 * ====================================================================================
 */

type SeparatorProps = {
  render?: RenderProp
  className?: string
}

function Separator({ render, className }: SeparatorProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: { className: cx(styles.Menu__separator, className) }
  })
}

export const Menu = {
  Popup,
  Item,
  GroupLabel,
  Separator
}

export declare namespace Menu {
  export namespace Popup {
    export type Props = PopupProps
  }
  export namespace Item {
    export type Props = ItemProps
  }
  export namespace GroupLabel {
    export type Props = GroupLabelProps
  }
  export namespace Separator {
    export type Props = SeparatorProps
  }
}
