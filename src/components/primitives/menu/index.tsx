/* eslint-disable react-refresh/only-export-components */
import { useRender } from "@base-ui/react"
import { cx } from "cva"
import type { ReactNode } from "react"

import { Typography } from "@/components/primitives/typography"

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

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = useRender.ComponentProps<"div">

function Popup({ render, children, className, ...rest }: PopupProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: { ...rest, className: cx(styles.Menu__popup, className), children }
  })
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = useRender.ComponentProps<"div"> & {
  /** Sits before the label at a fixed width, so labels line up whether or not one is present. */
  icon?: ReactNode
  /** Trailing slot, for a check mark or similar. */
  indicator?: ReactNode
}

function Item({ render, icon, indicator, children, className, ...rest }: ItemProps) {
  return (
    <Typography {...rest} size="x-small" render={render ?? <div />} className={cx(styles.Menu__item, className)}>
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

type GroupLabelProps = useRender.ComponentProps<"div">

function GroupLabel({ render, children, className, ...rest }: GroupLabelProps) {
  return (
    <Typography
      {...rest}
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

type SeparatorProps = useRender.ComponentProps<"div">

function Separator({ render, className, ...rest }: SeparatorProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: { ...rest, className: cx(styles.Menu__separator, className) }
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
