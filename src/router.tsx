import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"

import { NotFound } from "@/components/layouts/404"
import { ErrorPage } from "@/components/layouts/error"
import { PendingBar } from "@/components/layouts/pending-bar"
import { getQueryClient } from "@/query/client"

import { routeTree } from "./routeTree.gen"

function createAppRouter() {
  const queryClient = getQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
    defaultPendingComponent: PendingBar,
    // Hover or focus starts the next route's loader (and, for a post or thought, its MDX chunk —
    // see `preloadPostMdx`/`preloadThoughtMdx`) before the click that actually navigates there.
    defaultPreload: "intent",
    scrollRestoration: true,
    // Explicit: landing on a route already scrolled to where the reader left it should read as
    // "the page was already there", not as a scroll the reader can see happen.
    scrollRestorationBehavior: "instant"
    // The transition itself is scoped entirely in CSS (`index.scss`): `:root` opts out of capture,
    // so the header morphs live, and only the named `content` layer crossfades.
  })

  // Wires the query client's dehydrate/hydrate into the router's own SSR data pipeline (the same one
  // that already carries loader data to the client), and wraps the router tree in the client's
  // provider — so a route's `context.queryClient.ensureQueryData(...)` lands in the initial HTML
  // instead of only ever fetching after the client mounts.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

let browserRouter: ReturnType<typeof createAppRouter> | undefined

/**
 * A fresh router per request on the server, one per tab in the browser — same trade `getQueryClient`
 * makes, and for the same reason: a shared instance would leak one visitor's state into the next.
 * Memoized on the client so `client.tsx`'s own call (reading `getMatchedRoutes` before hydration)
 * and `StartClient`'s internal one share a single instance instead of building the route tree twice.
 */
export function getRouter() {
  if (typeof window === "undefined") return createAppRouter()

  browserRouter ??= createAppRouter()
  return browserRouter
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  /**
   * Read at request time by `/og/$`, which resolves a page's card from the route that matched it
   * rather than a second list, so a page cannot exist without a card.
   */
  interface StaticDataRouteOption {
    seo?: {
      title: string
      description: string
      /** Optional: some pages deliberately have none. */
      emoji?: string
    }
    /**
     * A parameterised route has no single card to declare, so it resolves one per match instead —
     * `undefined` for params that name nothing, which is what makes an unknown slug a 404 rather
     * than the section's card under someone else's title.
     */
    seoFor?: (params: Record<string, string>) => StaticDataRouteOption["seo"]
    /**
     * Every path such a route can answer for. Only the route knows what its params range over, and
     * the build needs that list to emit a card per post rather than one for `$slug` itself.
     */
    seoPaths?: () => Array<string>
    /**
     * Read by `client.tsx` for every matched route on the page being hydrated, before hydration
     * itself begins — see the comment there for why. A route with client-only work worth starting
     * this early (currently: warming a post or thought's MDX chunk) declares it here instead of
     * `client.tsx` needing to know which routes exist or what their paths look like.
     */
    eagerPreload?: (params: Record<string, string>) => void
  }
}
