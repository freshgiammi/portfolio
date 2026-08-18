import { createFileRoute } from "@tanstack/react-router"

import { ogImagePath } from "@/utils/seo"
import { cardFor } from "@/utils/seo/manifest"

/**
 * Every card is a file emitted at build time, so in production the CDN answers before this worker
 * is invoked and the renderer never ships to the edge. What's left here is what a file can't do:
 * standing in for a page whose card couldn't be emitted ahead of time, and refusing a path that
 * names no page at all.
 *
 * The `$` makes this a catch-all: one handler answers every `/og/*` url, with the remainder of the
 * path arriving as `params._splat` — a card's `<path>.png`.
 */

/** Always emitted, so redirecting to it can never point at a missing file. */
const FALLBACK = ogImagePath("/")

export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = pathFromCard(params._splat)
        const card = path ? await cardFor(path) : undefined
        if (!path || !card) return new Response("Unknown page", { status: 404 })

        // Dev has no emitted files to serve from, so it draws instead. The branch is compiled out of
        // the production worker, which is what keeps takumi and its wasm out of the bundle.
        if (import.meta.env.DEV) {
          const { generateOGImage } = await import("@/utils/seo/og")
          return new Response(await generateOGImage(card), {
            headers: { "Content-Type": "image/png", "Cache-Control": "no-store" }
          })
        }

        // The fallback is home's own card, so a home request that got this far has nothing to borrow.
        if (path === "/") return new Response("Missing card", { status: 404 })
        return Response.redirect(new URL(FALLBACK, request.url).href, 302)
      }
    }
  }
})

/** The inverse of `ogImagePath`: `blog/use-less.png` is the card for `/blog/use-less`. */
function pathFromCard(splat: string | undefined) {
  if (!splat?.endsWith(".png")) return undefined
  const name = splat.slice(0, -".png".length)
  return name === "index" ? "/" : `/${name}`
}
