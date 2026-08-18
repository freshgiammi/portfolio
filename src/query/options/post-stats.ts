import { queryOptions } from "@tanstack/react-query"

import { getPostStats } from "@/server/post-stats"

/**
 * Short, unlike the client's default: that one is sized to endpoints answering with `max-age=300`,
 * while these counts carry no cache headers and move whenever anyone reads or likes.
 */
const STALE_TIME = 30_000

/** Shared with `usePostStats`'s mutations, which write to this same cache entry by key. */
export const statsKey = (slug: string) => ["post-stats", slug] as const

/**
 * Shared with route loaders, so a page can `ensureQueryData` the exact same key/fn/staleness
 * `usePostStats` reads — otherwise a prefetch during SSR would land under a query the hook never
 * looks at, and stats would still pop in after the fact.
 *
 * `voter` is taken as a parameter rather than read internally, because the right way to read it
 * differs by caller: a loader reads `getServerVoterId()` (the cookie, so it works whichever side the
 * loader itself runs on), while `usePostStats` reads `getVoterId()` (storage, creating one if this is
 * the first visit). Passing the wrong one in from a loader would prefetch a stranger's reaction.
 */
export const postStatsQueryOptions = (slug: string, voter: string | undefined) =>
  queryOptions({
    queryKey: statsKey(slug),
    // Signal not forwarded — same reasoning as `activityQueryOptions`.
    queryFn: () => getPostStats({ data: { slug, voter } }),
    staleTime: STALE_TIME
  })
