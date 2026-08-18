import { Skeleton } from "@/components/primitives/skeleton"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/** The real primitive, over the smallest card worth covering. */
export default function SkeletonPreview() {
  return (
    <div className={styles.Card} aria-hidden="true">
      <Skeleton isLoading>
        <span className={styles.Card__avatar} />
      </Skeleton>
      <div className={styles.Card__lines}>
        <Skeleton isLoading>
          <Typography size="xxx-small" render={<span />}>
            A name goes here
          </Typography>
        </Skeleton>
        <Skeleton isLoading>
          <Typography size="xxx-small" render={<span />}>
            And a line about them, which is longer
          </Typography>
        </Skeleton>
      </div>
    </div>
  )
}
