/* eslint-disable react-refresh/only-export-components */
import { Tabs } from "@base-ui/react/tabs"
import { cx } from "cva"
import type { ReactNode } from "react"

import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps<Value extends string = string> = Omit<Tabs.Root.Props, "value" | "defaultValue" | "onValueChange"> & {
  value: Value
  onValueChange: (value: Value) => void
}

/** Holds the list and its panels together, and carries which of them is showing. */
function Root<Value extends string>({ value, onValueChange, ...rest }: RootProps<Value>) {
  return <Tabs.Root {...rest} value={value} onValueChange={next => onValueChange(next as Value)} />
}

/*
 * ====================================================================================
 * List
 * ====================================================================================
 */

type ListProps = Tabs.List.Props & {
  /** Names the row for assistive tech, which the tabs alone cannot: they say what, not what of. */
  label: string
}

function List({ label, className, ...rest }: ListProps) {
  return <Tabs.List {...rest} aria-label={label} className={cx(styles.Tab, className)} />
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = Tabs.Tab.Props & {
  /** Optional, and never the whole of a tab: the label stays beside it rather than in a tooltip. */
  icon?: ReactNode
}

function Item({ icon, children, className, ...rest }: ItemProps) {
  return (
    <Tabs.Tab {...rest} className={cx(styles.Tab__item, className)}>
      {icon}
      <Typography size="xxx-small" family="mono" render={<span />}>
        {children}
      </Typography>
    </Tabs.Tab>
  )
}

/*
 * ====================================================================================
 * Indicator
 * ====================================================================================
 */

type IndicatorProps = Tabs.Indicator.Props

/**
 * The moving ground under the active tab, drawn once for the row rather than as a background each
 * tab paints for itself: one element that moves is what makes the change read as a change.
 *
 * Rendered before hydration, because the page is served with a tab already active — left to React,
 * the row would arrive with nothing under it and fill in a moment later.
 */
function Indicator({ className, ...rest }: IndicatorProps) {
  return <Tabs.Indicator renderBeforeHydration {...rest} className={cx(styles.Tab__indicator, className)} />
}

/*
 * ====================================================================================
 * Panel
 * ====================================================================================
 */

type PanelProps = Tabs.Panel.Props

/** What its tab switches to. Unmounted while another one is showing, unless `keepMounted`. */
function Panel({ className, ...rest }: PanelProps) {
  return <Tabs.Panel {...rest} className={cx(styles.Tab__panel, className)} />
}

export const Tab = {
  Root,
  List,
  Item,
  Indicator,
  Panel
}

// Merged into the parts object so each part carries its own types: `Tab.Item.Props`.
export declare namespace Tab {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace List {
    export type Props = ListProps
  }
  export namespace Item {
    export type Props = ItemProps
  }
  export namespace Indicator {
    export type Props = IndicatorProps
  }
  export namespace Panel {
    export type Props = PanelProps
  }
}
