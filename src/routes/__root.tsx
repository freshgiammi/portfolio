import "../styles/index.scss"

import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ReactNode } from "react"

import { GeometricBackground } from "@/components/canvas/geometric-background"
import { NotFound } from "@/components/layouts/404"
import { PendingBar } from "@/components/layouts/pending-bar"
import { Snackbar } from "@/components/primitives/snackbar"
import { DEFAULT_PREFERENCES, getServerPreferences, type Preferences, toggleValue } from "@/preferences"
import { usePreferences } from "@/preferences/context"
import { PreferencesProvider } from "@/preferences/provider"
import { useTheme } from "@/theme/context/context"
import { ThemeProvider } from "@/theme/context/provider"

/**
 * The one case the server can't resolve: `theme: "system"` with the OS set to light. `tokens.scss`
 * already treats a document with no `data-theme` yet as dark, so this only has to act for that one
 * mismatch — everything else the server already got right from the cookie.
 */
const SYSTEM_THEME_SCRIPT = `(function () {
  try {
    var m = document.cookie.match(/(?:^|; )theme=([^;]+)/)
    if (m && decodeURIComponent(m[1]) === "system" && !matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "light")
    }
  } catch (e) {}
})()`

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => ({ preferences: getServerPreferences() }),
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "freshgiammi"
      }
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg"
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "freshgiammi",
        href: "/feed.xml"
      }
    ]
  }),
  component: RootComponent,
  // Renders the whole document itself, since a route's notFound() unmounts RootComponent along with
  // everything it owns, `<html>`'s attributes included.
  notFoundComponent: RootNotFound,
  // Same reasoning as `notFoundComponent`: without this, the router's default pending fallback would
  // replace `RootComponent`'s entire subtree — `<html>` included — with a bare `<div>`.
  pendingComponent: RootPending
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function RootComponent() {
  const { preferences } = Route.useLoaderData()

  return (
    <RootDocument initialPreferences={preferences}>
      <Outlet />
      {/* @tanstack/react-devtools is pinned to 0.10.9 (exact) in package.json: 0.10.10 pulls in
          @tanstack/devtools-ui@0.7.0, which imports a `use` export from solid-js/web that the
          resolved solid-js version doesn't have, breaking the dev build outright. Bump once that's
          fixed upstream. */}
      {import.meta.env.DEV && (
        <TanStackDevtools
          eventBusConfig={{ debug: true, connectToServerBus: true }}
          config={{ hideUntilHover: true }}
          plugins={[
            { name: "Router", render: <TanStackRouterDevtoolsPanel /> },
            { name: "Query", render: <ReactQueryDevtoolsPanel /> }
          ]}
        />
      )}
    </RootDocument>
  )
}

/**
 * Rendered only while root's own loader is still in flight, before `preferences` exists — so, unlike
 * `RootComponent`, this can't read them from `Route.useLoaderData()` and falls back to the same
 * defaults `PreferencesProvider` itself defaults to.
 */
function RootPending() {
  return (
    <RootDocument initialPreferences={DEFAULT_PREFERENCES}>
      <PendingBar />
    </RootDocument>
  )
}

/** The whole document, minus the app: a 404 is still a page and still has a theme. */
function RootNotFound(props: NotFound.Props) {
  const { preferences } = Route.useLoaderData()

  return (
    <RootDocument initialPreferences={preferences}>
      <NotFound {...props} />
    </RootDocument>
  )
}

type RootDocumentProps = Readonly<{
  children: ReactNode
  initialPreferences: Preferences
}>

function RootDocument({ children, initialPreferences }: RootDocumentProps) {
  return (
    // The QueryClientProvider itself now comes from `routerWithQueryClient`'s `Wrap`, one level above
    // the whole router tree, so the query client here is the same instance without a second provider.
    <PreferencesProvider initialPreferences={initialPreferences}>
      {/* Nested inside PreferencesProvider: theme is one of the stored preferences. */}
      <ThemeProvider>
        {/* Above Document, not inside it, so it survives a swap between the app and 404 shells. */}
        <Snackbar.Provider>
          <Document>{children}</Document>
        </Snackbar.Provider>
      </ThemeProvider>
    </PreferencesProvider>
  )
}

/**
 * Resolved from the same cookies on the server, so the rendered html already matches a reader with
 * stored preferences from the first byte. The one exception is `theme: "system"`: no cookie can carry
 * the OS's own light/dark preference, so `resolved` is `undefined` until hydration resolves it against
 * `matchMedia`. `SYSTEM_THEME_SCRIPT` covers the one case that gap gets wrong on first paint (CSS
 * defaults to dark for a themeless document, which is right unless the OS actually prefers light).
 */
function Document({ children }: Readonly<{ children: ReactNode }>) {
  const { resolved } = useTheme()
  const { preferences } = usePreferences()

  return (
    <html
      data-theme={resolved}
      data-accent={preferences.accent}
      data-grain={toggleValue(preferences.grain)}
      data-backdrop={toggleValue(preferences.backdrop)}
      data-unlocked={toggleValue(preferences.unlocked)}
      suppressHydrationWarning>
      <head>
        <HeadContent />
        <ScriptOnce>{SYSTEM_THEME_SCRIPT}</ScriptOnce>
      </head>
      <body>
        {/* Unmounted rather than hidden: it's a canvas animating on a timer, no point paying for that
            behind a `display: none`. */}
        {preferences.backdrop && <GeometricBackground />}
        {children}
        <Snackbar.Viewport />
        <Scripts />
      </body>
    </html>
  )
}
