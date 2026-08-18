import type { MakeRouteMatchUnion } from "@tanstack/react-router"
import { Link, useMatches, useRouter, useRouterState } from "@tanstack/react-router"
import type { FocusEvent, KeyboardEvent } from "react"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Typography } from "@/components/primitives/typography"
import { useExiting } from "@/hooks/useExiting"
import { labelFromSeoTitle } from "@/utils/routing/route-label"
import { buildTree, isPageRoute } from "@/utils/routing/route-tree"

import styles from "./index.module.scss"

type Crumb = { label: string; href: string; current?: boolean }

/**
 * Posts and thoughts pick their `<title>` from loader data, not `staticData`, so the trail has no
 * static SEO title to strip for them (see `route-label.ts`) — it has to read the same loader data
 * the page itself rendered from.
 */
function getDynamicTitle(match: MakeRouteMatchUnion): string | undefined {
  // The equality checks double as discriminant narrowing: only these routes' loader data carries a title.
  if (match.routeId === "/_main/blog/$slug/" || match.routeId === "/_main/thoughts/$slug/") {
    return match.loaderData?.title
  }
  return undefined
}

function useTrail(): { crumbs: Array<Crumb>; pages: Array<Crumb> } {
  const matches = useMatches()
  const router = useRouter()

  const pages = buildTree(Object.values(router.routesById).filter(isPageRoute))
    .children.filter(node => node.href)
    .map(node => ({ label: node.label, href: node.href! }))

  // A section layout's own match reports its pathname without a trailing slash ("/blog"), while its
  // index child's reports one with it ("/blog/"); normalizing before dedup collapses these into one
  // crumb, with the index winning since it comes later in the match chain. Map iteration keeps
  // insertion order, so the crumbs stay in match-chain (root-to-leaf) order.
  const normalizePathname = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname)
  const byPathname = new Map<string, MakeRouteMatchUnion>()
  for (const match of matches) byPathname.set(normalizePathname(match.pathname), match)

  const crumbs: Array<Crumb> = []
  for (const [href, match] of byPathname) {
    const title = getDynamicTitle(match) ?? match.staticData.seo?.title
    crumbs.push({ label: labelFromSeoTitle(href, title), href, current: false })
  }
  // The leaf of the match chain is the page being viewed. Frozen into the crumb itself, so a
  // dropped crumb's ghost can reproduce the exact presentation it had while alive.
  const leaf = crumbs.at(-1)
  if (leaf) leaf.current = true

  return { crumbs, pages }
}

/** The separator between crumbs; ghosts inherit theirs so no survivor keeps one pointing at them. */
function Slash() {
  return (
    <span aria-hidden="true" className={styles.Trail__slash}>
      /
    </span>
  )
}

/** One crumb's text. `live` marks the real trail: links to navigate and carries `aria-current`;
    exiting ghosts render the same two presentations with both stripped. */
function CrumbText({ crumb, live = false }: { crumb: Crumb; live?: boolean }) {
  return crumb.current ? (
    <Typography
      size="x-small"
      weight="medium"
      aria-current={live ? "page" : undefined}
      className={styles.Trail__current}>
      {crumb.label}
    </Typography>
  ) : (
    <Typography
      size="x-small"
      weight="regular"
      render={live ? <Link to={crumb.href} /> : undefined}
      className={styles.Trail__link}>
      {crumb.label}
    </Typography>
  )
}

/**
 * A plain breadcrumb with one door at its head. The leading list icon is the only chrome: hover it
 * with a pointer and the trail gives its slot to the full primary nav, laid out flat; tap it on a
 * phone and the header deepens instead — an overlay sheet of link rows over the content, never
 * pushing it down. Every crumb stays an ordinary link throughout; nothing mid-trail reacts to the
 * cursor passing through. Escape, a tap outside, or navigation closes whichever form is open.
 *
 * Both faces stay in the DOM; the resting one is `visibility: hidden`, so it drops out of the tab
 * order and the accessibility tree rather than merely fading.
 */
export function Breadcrumb() {
  const { crumbs, pages } = useTrail()
  const pathname = useRouterState({ select: state => state.location.pathname })
  const atRoot = pathname === "/"

  // `armed` is pointer-driven (hover opens, leaving closes); `pinned` is the click/tap toggle,
  // which is how touch and keyboard hold either form open. Whether home shows its list flat is
  // not state at all — `data-root` plus a CSS breakpoint decides, so server and client render
  // the same markup and no measurement can flicker on first paint.
  const [armed, setArmed] = useState(false)
  const [pinned, setPinned] = useState(false)
  const showPages = armed || pinned

  // Navigating from the pages face means its job is done — the close is immediate and the live
  // morph plays in real CSS the moment the route lands.
  const [renderedPathname, setRenderedPathname] = useState(pathname)
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname)
    setPinned(false)
    setArmed(false)
  }

  // Crumbs the new route dropped linger as inert ghosts for one staggered exit; growth is covered
  // by the fresh crumb's entrance. Ghosts mount in the same commit that removed their live twins,
  // the hook's recency-based churn guard keeps the router's brief match reverts from faking a
  // drop, and each ghost unmounts on its own `animationend`.
  const { exiting, exitHandlerFor } = useExiting(crumbs, crumb => crumb.href)

  const releaseOnBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPinned(false)
  }
  const releaseOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") setPinned(false)
  }

  // The deepened-header form floats outside this element's line, so a tap beside it must close it;
  // pointer-leave already covers mouse. Focus-out (releaseOnBlur) covers keyboard users.
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    let remove: (() => void) | undefined
    if (pinned) {
      const onDown = (event: PointerEvent) => {
        if (navRef.current && !navRef.current.contains(event.target as Node)) setPinned(false)
      }
      document.addEventListener("pointerdown", onDown)
      remove = () => document.removeEventListener("pointerdown", onDown)
    }
    return remove
  }, [pinned])

  return (
    <nav
      aria-label="Site"
      className={styles.Trail}
      data-links={showPages || undefined}
      data-root={atRoot || undefined}
      onPointerLeave={() => setArmed(false)}
      onBlur={releaseOnBlur}
      onKeyDown={releaseOnEscape}
      ref={navRef}>
      <button
        type="button"
        className={styles.Trail__reveal}
        aria-expanded={showPages}
        aria-label={showPages ? "Close page list" : "Show all pages"}
        onClick={() => setPinned(value => !value)}
        onPointerEnter={() => setArmed(true)}
        onFocus={() => setArmed(true)}>
        <span aria-hidden="true" className={styles.Trail__revealIcon}>
          <Icon.ListIcon weight="bold" />
          <Icon.XIcon weight="bold" />
        </span>
      </button>

      <div className={styles.Trail__faces}>
        <ol className={styles.Trail__crumbs}>
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1
            return (
              <li key={crumb.href}>
                <CrumbText crumb={crumb} live />
                {!last && <Slash />}
              </li>
            )
          })}
          {/* Dropped crumbs exit as one group that owns every slash it used to sit behind: the
              first ghost inherits the separator the surviving trail just shed (its new last crumb
              is highlighted immediately and carries no slash), inner ghosts keep their internal
              ones, and the old current — which never had a slash — leaves bare. */}
          {exiting.map((crumb, index) => (
            <li
              key={`exiting-${crumb.href}`}
              data-exiting
              aria-hidden="true"
              style={{ animationDelay: `${index * 40}ms` }}
              onAnimationEnd={exitHandlerFor(crumb)}>
              {index === 0 && <Slash />}
              <CrumbText crumb={crumb} />
              {!crumb.current && <Slash />}
            </li>
          ))}
        </ol>

        <ol className={styles.Trail__pages}>
          {[{ label: "Home", href: "/" }, ...pages].map(page => {
            const active =
              page.href === "/" ? pathname === "/" : pathname === page.href || pathname.startsWith(`${page.href}/`)
            return (
              <li key={page.href}>
                <Typography
                  size="x-small"
                  weight={active ? "medium" : "regular"}
                  render={<Link to={page.href} />}
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                  className={styles.Trail__link}>
                  {page.label}
                </Typography>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
