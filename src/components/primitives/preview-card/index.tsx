/* eslint-disable react-refresh/only-export-components */
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card"
import { cx } from "cva"
import type { ComponentProps } from "react"

import { useScopedTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

// Generic rather than `ComponentProps`: the payload type is what lets one popup describe whichever
// of its triggers opened it, and inferring it away leaves the render function holding `unknown`.
type RootProps<Payload = unknown> = BasePreviewCard.Root.Props<Payload>

function Root<Payload>(props: RootProps<Payload>) {
  return <BasePreviewCard.Root {...props} />
}

/*
 * ====================================================================================
 * Trigger
 * ====================================================================================
 */

type TriggerProps<Payload = unknown> = BasePreviewCard.Trigger.Props<Payload>

function Trigger<Payload>(props: TriggerProps<Payload>) {
  return <BasePreviewCard.Trigger {...props} />
}

/*
 * ====================================================================================
 * Portal
 * ====================================================================================
 */

type PortalProps = ComponentProps<typeof BasePreviewCard.Portal>

function Portal(props: PortalProps) {
  return <BasePreviewCard.Portal {...props} />
}

/*
 * ====================================================================================
 * Positioner
 * ====================================================================================
 */

type PositionerProps = ComponentProps<typeof BasePreviewCard.Positioner>

function Positioner(props: PositionerProps) {
  return <BasePreviewCard.Positioner sideOffset={8} data-theme={useScopedTheme()} {...props} />
}

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = ComponentProps<typeof BasePreviewCard.Popup>

function Popup({ className, ...rest }: PopupProps) {
  return <BasePreviewCard.Popup className={cx(styles.PreviewCard__popup, className)} {...rest} />
}

/*
 * ====================================================================================
 * Viewport
 * ====================================================================================
 */

type ViewportProps = ComponentProps<typeof BasePreviewCard.Viewport>

/** Only worth reaching for when one popup is shared across triggers with different content: it's
    what lets the popup morph between them instead of jump-cutting. */
function Viewport({ className, ...rest }: ViewportProps) {
  return <BasePreviewCard.Viewport className={cx(styles.PreviewCard__viewport, className)} {...rest} />
}

export const PreviewCard = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Viewport
}

// Merged into the parts object so each part carries its own types: `PreviewCard.Popup.Props`.
export declare namespace PreviewCard {
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
  export namespace Viewport {
    export type Props = ViewportProps
  }
}
