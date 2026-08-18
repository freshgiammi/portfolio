import { ClientOnly } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import { Skeleton } from "@/components/primitives/skeleton"
import type { Showcase } from "@/data/showcases"

import styles from "./index.module.scss"

/** Each preview lazy-loads into its own chunk, so a page of four cards doesn't pay for all four demos up front. */
const PREVIEWS: Record<string, ReturnType<typeof lazy>> = {
  "polaroid-stack": lazy(() => import("./previews/polaroid")),
  skeleton: lazy(() => import("./previews/skeleton")),
  particles: lazy(() => import("./previews/particles")),
  confetti: lazy(() => import("./previews/confetti")),
  scrollable: lazy(() => import("./previews/scrollable"))
}

type CardPreviewProps = {
  id: Showcase["id"]
}

/** The picture on a card: the real component, live, rather than a screenshot that would go stale. */
export function CardPreview({ id }: CardPreviewProps) {
  const Preview = PREVIEWS[id]

  // ClientOnly, since resolving these lazy imports on the server hangs the request.
  const loading = (
    <Skeleton isLoading>
      <span className={styles.Loading} />
    </Skeleton>
  )

  return (
    <div className={styles.Preview}>
      <ClientOnly fallback={loading}>
        <Suspense fallback={loading}>{Preview ? <Preview /> : null}</Suspense>
      </ClientOnly>
    </div>
  )
}
