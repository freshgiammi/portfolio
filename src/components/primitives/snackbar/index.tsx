/* eslint-disable react-refresh/only-export-components */
import { Toast as BaseToast } from "@base-ui/react/toast"
import { cx } from "cva"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/**
 * The one manager every snackbar goes through, created outside React so `snackbar()` can be called
 * from anywhere: an event handler, a mutation, a module that has never heard of a component. The
 * provider below subscribes the tree to it rather than owning it.
 */
const manager = BaseToast.createToastManager()

type SnackbarOptions = {
  /** The line that says what happened, in a handful of words. */
  title: string
  /** The rest of it, for a reader who wants the rest of it. */
  description?: string
  /** How long it stays. Left off, it uses the provider's own. */
  timeout?: number
}

/**
 * Raise a snackbar.
 *
 * A plain function rather than a hook, because the things worth announcing rarely happen inside a
 * component that wants a subscription: they happen in a handler, halfway through a promise, or in a
 * module with no view of its own.
 *
 * @example
 * snackbar({ title: "Copied", description: "The link is on your clipboard." })
 */
export function snackbar(options: SnackbarOptions) {
  return manager.add(options)
}

/*
 * ====================================================================================
 * Provider
 * ====================================================================================
 */

type ProviderProps = BaseToast.Provider.Props

function Provider(props: ProviderProps) {
  return <BaseToast.Provider timeout={6000} toastManager={manager} {...props} />
}

/*
 * ====================================================================================
 * Viewport
 * ====================================================================================
 */

type ViewportProps = BaseToast.Viewport.Props

/**
 * Where snackbars land, and the whole of what a caller has to render: the list inside is every one
 * the manager is holding, so nothing else in the app has to know a snackbar exists to raise one.
 */
function Viewport({ className, ...rest }: ViewportProps) {
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport {...rest} className={cx(styles.Snackbar__viewport, className)}>
        <List />
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

export const Snackbar = {
  Provider,
  Viewport
}

// Merged into the parts object so each part carries its own types: `Snackbar.Viewport.Props`.
export declare namespace Snackbar {
  export namespace Provider {
    export type Props = ProviderProps
  }
  export namespace Viewport {
    export type Props = ViewportProps
  }
  export type Options = SnackbarOptions
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function List() {
  const { toasts } = BaseToast.useToastManager()

  return toasts.map(toast => (
    <BaseToast.Root key={toast.id} toast={toast} className={styles.Snackbar}>
      <div className={styles.Snackbar__body}>
        <BaseToast.Title
          render={<Typography size="xx-small" weight="semibold" render={<span />} className={styles.Snackbar__title} />}
        />
        <BaseToast.Description
          render={<Typography size="xxx-small" weight="regular" render={<span />} className={styles.Snackbar__text} />}
        />
      </div>

      <BaseToast.Close className={styles.Snackbar__close} aria-label="Dismiss">
        <Icon.XIcon size={12} />
      </BaseToast.Close>
    </BaseToast.Root>
  ))
}
