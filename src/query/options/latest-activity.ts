import { queryOptions } from "@tanstack/react-query"

import { getActivity } from "@/server/activity"

/**
 * Shared with the home route's loader, so it can prefetch the same query `LatestActivity` reads.
 * The signal is deliberately not forwarded: opting in lets TanStack cancel the fetch when the last
 * observer unmounts, which here would only throw away a request the reader is about to want again
 * on the way back — and its abort surfaces as a spurious unhandled `AbortError`.
 */
export const activityQueryOptions = () =>
  queryOptions({ queryKey: ["activity"], queryFn: () => getActivity() })
