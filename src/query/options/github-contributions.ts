import { queryOptions } from "@tanstack/react-query"

import { getContributions } from "@/server/contributions"
import { getMilestonesByDate } from "@/server/milestones"

/**
 * Shared with the home route's loader, so it can prefetch the same query `GithubContributions`
 * reads. Signals deliberately not forwarded — see `activityQueryOptions` for why.
 */
export const contributionsQueryOptions = () =>
  queryOptions({ queryKey: ["contributions"], queryFn: () => getContributions() })

/** Shared with the home route's loader, so it can prefetch the same query `GithubContributions` reads. */
export const milestonesQueryOptions = () =>
  queryOptions({ queryKey: ["milestones"], queryFn: () => getMilestonesByDate() })
