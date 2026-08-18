import type { AnyRoute } from "@tanstack/react-router"

import { labelFromSeoTitle } from "./route-label"

export type TreeNode = {
  label: string
  href?: string
  children: Array<TreeNode>
}

/**
 * Real, static pages only: a route earns a node by rendering something of its own and by not being
 * parameterized (`$slug`/`$id` leaves would grow without bound). Individual showcase pieces are
 * excluded the same way, just by prefix instead of a `$param`, since each one is a literally-named
 * route rather than a dynamic segment — they sit directly under `/craft/`, indistinguishable by
 * path shape from a hypothetical future real detail page, so this excludes anything strictly under
 * there for now (not `/craft/` itself, or the index would vanish too) rather than a narrower
 * "showcase" prefix.
 *
 * Layout routes (a directory's own `foo.tsx` wrapping `foo/index.tsx` and its siblings, pathless
 * ones like `_main` included) are excluded by construction rather than by name: every leaf/page
 * route's id ends in `/` (file-based routing's own convention for an index), while a layout's does
 * not — so this needs no explicit list of layout paths to stay in sync as new ones are added.
 */
export function isPageRoute(route: AnyRoute): boolean {
  const id: string = route.id
  const fullPath: string = route.fullPath
  if (id === "__root__") return false
  if (!id.endsWith("/")) return false
  if (!route.options.component) return false
  if (fullPath.startsWith("/api")) return false
  if (fullPath.includes("$")) return false
  if (fullPath !== "/craft/" && fullPath.startsWith("/craft/")) return false
  return true
}

/**
 * The order pages are offered in, rather than the path order the router happens to register them in.
 * It reads as a narrative — who I am, what I have done, then the writing and the work itself — which
 * no property of the routes themselves encodes. Anything unlisted keeps its discovered order behind
 * the listed ones, so a new page appears without having to be added here first.
 */
const PAGE_ORDER = ["/about", "/work", "/blog", "/thoughts", "/craft"]

const orderOf = (href?: string) => {
  const rank = href ? PAGE_ORDER.indexOf(href) : -1
  return rank === -1 ? PAGE_ORDER.length : rank
}

function sortTree(node: TreeNode) {
  node.children.sort((a, b) => orderOf(a.href) - orderOf(b.href))
  for (const child of node.children) sortTree(child)
}

export function buildTree(routes: Array<AnyRoute>): TreeNode {
  const root: TreeNode = { label: "/", href: "/", children: [] }

  const sorted = [...routes].sort((a, b) => (a.fullPath as string).length - (b.fullPath as string).length)
  for (const route of sorted) {
    const routeFullPath: string = route.fullPath
    const fullPath = routeFullPath.replace(/\/$/, "")
    if (fullPath === "") continue

    const segments = fullPath.split("/").filter(Boolean)
    let node = root
    let pathSoFar = ""

    for (const segment of segments) {
      pathSoFar += `/${segment}`
      let child = node.children.find(c => c.label.toLowerCase() === segment.toLowerCase() && !c.href)
      const isLeaf = pathSoFar === fullPath

      if (isLeaf) {
        const seo = route.options.staticData?.seo
        node.children.push({
          label: labelFromSeoTitle(pathSoFar, seo?.title),
          href: pathSoFar,
          children: []
        })
      } else {
        if (!child) {
          child = { label: segment, children: [] }
          node.children.push(child)
        }
        node = child
      }
    }
  }

  sortTree(root)
  return root
}
