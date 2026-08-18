import { StartClient } from "@tanstack/react-start/client"
import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"

import { getRouter } from "@/router"

/**
 * Start resolves this file if it exists and falls back to its own otherwise, so the only reason it
 * is here is the import below. Keep the hydration in step with the framework default.
 */

// Vite serves no HTML here, so the transform that injects the DevTools client never runs; this is
// the documented substitute: https://devtools.vite.dev/guide/#projects-without-an-html-entry
// Dynamic import keeps the devtools client out of the production bundle.
if (import.meta.env.DEV) {
  void import("@vitejs/devtools/client/inject")
}

// Some routes have client-only work worth starting before hydration itself begins — currently, a
// post or thought warming its own MDX chunk: the compiled component can't cross the loader's
// server-to-client serialization boundary, so the loader's own `preload*` call server-side never
// reaches the client, and left alone that fetch only starts once hydration's render reaches the
// component that calls `use()` on it, after every other chunk the rest of the page already queued.
// Reading `eagerPreload` off the matched routes here, rather than hardcoding which paths need this,
// means a route declares its own early work and nothing here has to know it exists.
const [matchedRoutes, rawParams] = getRouter().getMatchedRoutes(window.location.pathname)
for (const route of matchedRoutes) route.options.staticData?.eagerPreload?.(rawParams)

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>
  )
})
