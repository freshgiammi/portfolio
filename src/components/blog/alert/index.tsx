import { cx } from "cva"
import type { ComponentProps } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

const ALERT_META = {
  note: { label: "Note", icon: Icon.InfoIcon },
  tip: { label: "Tip", icon: Icon.LightbulbIcon },
  important: { label: "Important", icon: Icon.MegaphoneIcon },
  warning: { label: "Warning", icon: Icon.WarningIcon },
  caution: { label: "Caution", icon: Icon.WarningOctagonIcon }
} as const

type AlertProps = ComponentProps<"div"> & {
  /** The GitHub-style alert kind, lowercased from the `[!NOTE]` etc. marker. */
  type: keyof typeof ALERT_META
  children: React.ReactNode
}

export function Alert({ type, children, className, ...rest }: AlertProps) {
  const { label, icon: AlertIcon } = ALERT_META[type]

  return (
    <div {...rest} className={cx(styles.Alert, className)} data-type={type}>
      <Typography size="x-small" weight="semibold" render={<div />} className={styles.Alert__label}>
        <AlertIcon size={16} weight="bold" />
        {label}
      </Typography>
      <div className={styles.Alert__body}>{children}</div>
    </div>
  )
}

export declare namespace Alert {
  export type Props = AlertProps
}
