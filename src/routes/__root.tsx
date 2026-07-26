/// <reference types="vite/client" />
import "../styles/index.scss"

import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ReactNode } from "react"

import { NotFound } from "@/components/layouts/404"
import { getQueryClient } from "@/query/client"
import { getServerTheme, type ThemeKey } from "@/theme"
import { useTheme } from "@/theme/context/context"
import { ThemeProvider } from "@/theme/context/provider"

/**
 * Owns `data-theme` on the document element, outside React.
 *
 * It applies the persisted theme before hydration so there is no flash, and then keeps watching the
 * attribute. React treats `html` as a singleton it can neither create nor destroy, so unmounting the
 * component that rendered it clears its attributes: swapping between the app shell and the not-found
 * shell does exactly that, and the surviving tree runs no effect afterwards to put it back. Nothing
 * inside React can be the owner of this attribute, because everything inside React can unmount.
 *
 * The observer only ever writes when the value differs, so it cannot loop against React or against
 * `setTheme`. It watches the document element alone, so a scoped `data-theme` on any other node is
 * none of its business.
 */
const THEME_SCRIPT = `(function () {
  try {
    var root = document.documentElement
    var resolve = function () {
      var m = document.cookie.match(/(?:^|; )theme=([^;]+)/)
      var t = m ? decodeURIComponent(m[1]) : "system"
      if (t === "system") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      return t
    }
    var apply = function () {
      var t = resolve()
      if (root.getAttribute("data-theme") !== t) root.setAttribute("data-theme", t)
    }
    apply()
    new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ["data-theme"] })
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply)
  } catch (e) {}
})()`

export const Route = createRootRoute({
  loader: () => ({ theme: getServerTheme() }),
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
      }
    ]
  }),
  component: RootComponent,
  // Rendered instead of `RootComponent` when a route throws `notFound({ routeId: rootRouteId })`, so
  // this branch has to render the document itself. Anything the shell owns, `<html data-theme>`
  // included, would otherwise be torn down on the way in.
  notFoundComponent: RootNotFound
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function RootComponent() {
  const { theme } = Route.useLoaderData()

  return (
    <RootDocument initialTheme={theme}>
      <Outlet />
      <TanStackDevtools
        eventBusConfig={{ debug: true, connectToServerBus: true }}
        config={{ hideUntilHover: true }}
        plugins={[
          { name: "Router", render: <TanStackRouterDevtoolsPanel /> },
          { name: "Query", render: <ReactQueryDevtoolsPanel /> }
        ]}
      />
    </RootDocument>
  )
}

/** The whole document, minus the app: a 404 is still a page and still has a theme. */
function RootNotFound(props: NotFound.Props) {
  const { theme } = Route.useLoaderData()

  return (
    <RootDocument initialTheme={theme}>
      <NotFound {...props} />
    </RootDocument>
  )
}

type RootDocumentProps = Readonly<{
  children: ReactNode
  initialTheme: ThemeKey
}>

function RootDocument({ children, initialTheme }: RootDocumentProps) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ThemeProvider initialTheme={initialTheme}>
        <Document>{children}</Document>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

/**
 * The attribute is rendered here as well as guarded by `THEME_SCRIPT`, and the two cannot disagree:
 * both resolve from the same cookie and the same media query.
 *
 * Rendering it means the server emits it for a reader with an explicit preference, so the html is
 * correct before any script runs. It is absent server-side only for "system", which cannot be
 * resolved there, and the script paints that case before hydration. The script's observer is what
 * puts it back when React clears the singleton on a shell swap.
 */
function Document({ children }: Readonly<{ children: ReactNode }>) {
  const { resolved } = useTheme()

  return (
    <html data-theme={resolved} suppressHydrationWarning>
      <head>
        <HeadContent />
        <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
