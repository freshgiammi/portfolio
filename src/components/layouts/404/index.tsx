import { Link, type NotFoundRouteProps } from "@tanstack/react-router"
import { Image } from "@unpic/react"
import { staticAssets } from "virtual:static-assets"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

type NotFoundProps = NotFoundRouteProps

export function NotFound(_props: NotFoundProps) {
  return (
    <div className={styles.NotFound}>
      <Typography size="large" family="serif">
        404
      </Typography>
      <Typography size="x-small" weight="regular" className={styles.NotFound__subtitle}>
        This page doesn&apos;t exist.
      </Typography>
      <Image src={staticAssets("images/404.jpg")} alt="" layout="fullWidth" className={styles.NotFound__image} />

      <Typography size="x-small" className={styles.NotFound__homeLink} render={<Link to="/" />}>
        <Icon.ArrowLeftIcon size={14} />
        Go home
      </Typography>
    </div>
  )
}

export declare namespace NotFound {
  export type Props = NotFoundProps
}
