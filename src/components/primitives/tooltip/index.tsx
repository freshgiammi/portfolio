/* eslint-disable react-refresh/only-export-components */
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { cx } from "cva"
import type { ComponentProps } from "react"

import { useScopedTheme } from "@/theme/context/context"
import { getTypographyAttributes } from "@/utils/typography"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Provider
 * ====================================================================================
 */

type ProviderProps = ComponentProps<typeof BaseTooltip.Provider>

function Provider(props: ProviderProps) {
  return <BaseTooltip.Provider delay={150} closeDelay={100} {...props} />
}

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

// Generic rather than `ComponentProps`: the payload type is what lets one popup describe whichever
// of its triggers opened it, and inferring it away leaves the render function holding `unknown`.
type RootProps<Payload = unknown> = BaseTooltip.Root.Props<Payload>

function Root<Payload>(props: RootProps<Payload>) {
  return <BaseTooltip.Root {...props} />
}

/*
 * ====================================================================================
 * Trigger
 * ====================================================================================
 */

type TriggerProps<Payload = unknown> = BaseTooltip.Trigger.Props<Payload>

function Trigger<Payload>(props: TriggerProps<Payload>) {
  return <BaseTooltip.Trigger {...props} />
}

/*
 * ====================================================================================
 * Portal
 * ====================================================================================
 */

type PortalProps = ComponentProps<typeof BaseTooltip.Portal>

function Portal(props: PortalProps) {
  return <BaseTooltip.Portal {...props} />
}

/*
 * ====================================================================================
 * Positioner
 * ====================================================================================
 */

type PositionerProps = ComponentProps<typeof BaseTooltip.Positioner>

function Positioner(props: PositionerProps) {
  return <BaseTooltip.Positioner sideOffset={8} data-theme={useScopedTheme()} {...props} />
}

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = ComponentProps<typeof BaseTooltip.Popup>

function Popup({ className, ...rest }: PopupProps) {
  return (
    <BaseTooltip.Popup
      className={cx(styles.Tooltip__popup, className)}
      {...getTypographyAttributes({ size: "x-small" })}
      {...rest}
    />
  )
}

/*
 * ====================================================================================
 * Arrow
 * ====================================================================================
 */

type ArrowProps = ComponentProps<typeof BaseTooltip.Arrow>

function Arrow({ className, ...rest }: ArrowProps) {
  return <BaseTooltip.Arrow className={cx(styles.Tooltip__arrow, className)} {...rest} />
}

export const Tooltip = {
  Provider,
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow
}

// Merged into the parts object so each part carries its own types: `Tooltip.Popup.Props`.
export declare namespace Tooltip {
  export namespace Provider {
    export type Props = ProviderProps
  }
  export namespace Root {
    export type Props = RootProps
  }
  export namespace Trigger {
    export type Props = TriggerProps
  }
  export namespace Portal {
    export type Props = PortalProps
  }
  export namespace Positioner {
    export type Props = PositionerProps
  }
  export namespace Popup {
    export type Props = PopupProps
  }
  export namespace Arrow {
    export type Props = ArrowProps
  }
}
