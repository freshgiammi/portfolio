import { createRouter } from "@tanstack/react-router"

import { NotFound } from "@/components/layouts/404"
import { ErrorPage } from "@/components/layouts/error"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
    scrollRestoration: true,
    // Explicit, so route-navigation scroll restoration stays instant regardless of the
    // global CSS `scroll-behavior: smooth` (used for in-page anchor jumps elsewhere).
    scrollRestorationBehavior: "instant",
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? [] : false)
    }
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
  /**
   * Read at build time by the OG plugin, which walks this route tree rather than a second list, so
   * a page cannot exist without a card. A route that declares nothing gets the default one.
   */
  interface StaticDataRouteOption {
    seo?: {
      title: string
      description: string
      /** Optional: some pages deliberately have none. */
      emoji?: string
    }
  }
}
