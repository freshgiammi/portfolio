import { Link, type NotFoundRouteProps } from "@tanstack/react-router"
import { cx } from "cva"
import type { ComponentProps } from "react"
import { staticAssets } from "virtual:static-assets"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

type NotFoundProps = NotFoundRouteProps & ComponentProps<"div">

export function NotFound({ className, ...rest }: NotFoundProps) {
  return (
    <div {...rest} className={cx(styles.NotFound, className)}>
      <Typography size="large" family="serif">
        404
      </Typography>
      <Typography size="x-small" weight="regular" className={styles.NotFound__subtitle}>
        This page wandered off. There&apos;s nothing here.
      </Typography>
      <Image src={staticAssets("images/404.jpg")} alt="" className={styles.NotFound__image} />
      <Button variant="tertiary" icon={<Icon.ArrowLeftIcon />} render={<Link to="/" />}>
        Go home
      </Button>
    </div>
  )
}

export declare namespace NotFound {
  export type Props = NotFoundProps
}
