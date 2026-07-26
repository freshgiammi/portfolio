import { Link } from "@tanstack/react-router"
import { Image } from "@unpic/react"
import { staticAssets } from "virtual:static-assets"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import { env } from "@/env"

import styles from "./index.module.scss"

type ErrorPageProps = {
  error: Error
  reset: () => void
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className={styles.ErrorPage}>
      <Typography size="large" family="serif">
        Oops
      </Typography>
      <Typography size="x-small" weight="regular" className={styles.ErrorPage__subtitle}>
        Something went wrong.
      </Typography>
      {env.NODE_ENV === "development" && (
        <Typography size="xxx-small" family="mono" className={styles.ErrorPage__message}>
          {error.message}
        </Typography>
      )}
      <Image src={staticAssets("images/404.jpg")} alt="" layout="fullWidth" className={styles.ErrorPage__image} />

      <div className={styles.ErrorPage__actions}>
        <Typography
          size="x-small"
          className={styles.ErrorPage__retryButton}
          render={<button type="button" onClick={reset} />}>
          <Icon.ArrowClockwiseIcon size={14} />
          Try again
        </Typography>
        <Typography size="x-small" className={styles.ErrorPage__homeLink} render={<Link to="/" />}>
          <Icon.ArrowLeftIcon size={14} />
          Go home
        </Typography>
      </div>
    </div>
  )
}

export declare namespace ErrorPage {
  export type Props = ErrorPageProps
}
