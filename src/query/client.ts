import { QueryClient } from "@tanstack/react-query"

/**
 * Defaults chosen against the routes these queries actually hit: they answer with
 * `max-age=300, s-maxage=900`, so anything shorter than that here would only ever re-read a cache.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        // Nothing on this site is live enough to be worth a refetch every time a tab regains focus.
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  })
}

let browserClient: QueryClient | undefined

/**
 * A fresh client per request on the server, one per tab in the browser.
 *
 * Sharing a client across server requests would serve one visitor's cache to the next. Creating one
 * per React mount has the opposite problem: the document shell remounts when a route throws a
 * root-level `notFound`, and a client created inside it would take the cache with it.
 */
export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient()

  browserClient ??= createQueryClient()
  return browserClient
}
