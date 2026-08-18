/* eslint-disable react-refresh/only-export-components */
import { Popover as BasePopover } from "@base-ui/react/popover"
import { cx } from "cva"

import { useScopedTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = BasePopover.Root.Props

function Root(props: RootProps) {
  return <BasePopover.Root {...props} />
}

/*
 * ====================================================================================
 * Trigger
 * ====================================================================================
 */

type TriggerProps = BasePopover.Trigger.Props

function Trigger(props: TriggerProps) {
  return <BasePopover.Trigger {...props} />
}

/*
 * ====================================================================================
 * Portal
 * ====================================================================================
 */

type PortalProps = BasePopover.Portal.Props

function Portal(props: PortalProps) {
  return <BasePopover.Portal {...props} />
}

/*
 * ====================================================================================
 * Positioner
 * ====================================================================================
 */

type PositionerProps = BasePopover.Positioner.Props

function Positioner(props: PositionerProps) {
  // The outermost portalled node, so the whole popup follows the scope it was opened from rather
  // than the document. Spread first, so a caller can still override it.
  return <BasePopover.Positioner sideOffset={6} data-theme={useScopedTheme()} {...props} />
}

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = BasePopover.Popup.Props

function Popup({ className, ...rest }: PopupProps) {
  return <BasePopover.Popup className={cx(styles.Popover__popup, className)} {...rest} />
}

export const Popover = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup
}

// Merged into the parts object so each part carries its own types: `Popover.Popup.Props`.
export declare namespace Popover {
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
}
