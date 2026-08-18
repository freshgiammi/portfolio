import { Skeleton } from "@/components/primitives/skeleton"

import styles from "./index.module.scss"

const LINES = 6

/** A handful of paragraph-shaped lines, for the moment before a post or thought's MDX chunk arrives. */
export function ProseSkeleton() {
  return (
    <div className={styles.ProseSkeleton} aria-hidden="true">
      {Array.from({ length: LINES }, (_, index) => (
        <Skeleton key={index} isLoading>
          <span className={styles.ProseSkeleton__line} />
        </Skeleton>
      ))}
    </div>
  )
}
