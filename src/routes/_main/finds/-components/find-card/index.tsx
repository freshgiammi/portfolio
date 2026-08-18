import type { Ref } from "react"

import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import type { Find } from "@/data/finds"
import { findHost } from "@/data/finds"

import styles from "./index.module.scss"

type FindCardProps = {
  find: Find
  /** Forwarded because the rail measures a card to know how wide every card in it is. */
  ref?: Ref<HTMLAnchorElement>
}

/** One saved link, preview first, at the width a rail of them wants. */
export function FindCard({ find, ref }: FindCardProps) {
  const host = findHost(find)

  return (
    <a href={find.url} target="_blank" rel="noopener noreferrer" className={styles.Card} ref={ref}>
      <div className={styles.Card__preview}>
        <Image
          src={find.image}
          alt={find.title}
          className={styles.Card__image}
          fallback={
            <span className={styles.Card__previewFallback}>
              <Icon.GlobeSimpleIcon size={20} />
              <Typography size="xxx-small" family="mono" render={<span />}>
                {host}
              </Typography>
            </span>
          }
        />
      </div>

      <div className={styles.Card__body}>
        <div className={styles.Card__titleRow}>
          <Typography size="small" weight="semibold" className={styles.Card__title}>
            {find.title}
          </Typography>
          <Typography size="xxx-small" family="mono" render={<span />} className={styles.Card__host}>
            {host}
            <Icon.ArrowUpRightIcon size={12} />
          </Typography>
        </div>

        <Typography size="xx-small" weight="regular" className={styles.Card__description}>
          {find.description}
        </Typography>
      </div>
    </a>
  )
}

export declare namespace FindCard {
  export type Props = FindCardProps
}
