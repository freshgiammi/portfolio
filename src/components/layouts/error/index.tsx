import { Link } from "@tanstack/react-router"
import { cx } from "cva"
import type { ComponentProps } from "react"
import { staticAssets } from "virtual:static-assets"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import { env } from "@/env"

import styles from "./index.module.scss"

type ErrorPageProps = ComponentProps<"div"> & {
  error: Error
  reset: () => void
}

export function ErrorPage({ error, reset, className, ...rest }: ErrorPageProps) {
  return (
    <div {...rest} className={cx(styles.ErrorPage, className)}>
      <Typography size="large" family="serif">
        Oops
      </Typography>
      <Typography size="x-small" weight="regular" className={styles.ErrorPage__subtitle}>
        Something went wrong on my end — sorry about that.
      </Typography>
      {env.NODE_ENV === "development" && (
        <Typography size="xxx-small" family="mono" className={styles.ErrorPage__message}>
          {error.message}
        </Typography>
      )}
      <Image src={staticAssets("images/404.jpg")} alt="" className={styles.ErrorPage__image} />

      <div className={styles.ErrorPage__actions}>
        <Button variant="tertiary" icon={<Icon.ArrowClockwiseIcon />} onClick={reset}>
          Try again
        </Button>
        <Button variant="tertiary" icon={<Icon.ArrowLeftIcon />} render={<Link to="/" />}>
          Go home
        </Button>
      </div>
    </div>
  )
}

export declare namespace ErrorPage {
  export type Props = ErrorPageProps
}
