import type { AnyRoute } from "@tanstack/react-router"

import type { PageSeo } from "@/utils/seo"
import { ogImagePath, sectionFromPath } from "@/utils/seo"
import type { generateOGImage } from "@/utils/seo/og"

/** What a matched route says about a page, plus the section and card style derived from its path. */
export type CardContent = PageSeo & { section: string; variant: Parameters<typeof generateOGImage>[0]["variant"] }

/** What one emitted card carries: its output file plus everything the renderer needs. */
export type Card = { file: string } & Parameters<typeof generateOGImage>[0]

/**
 * The deepest matched route with something to say about itself wins, so a post answers for its own
 * path while `/blog` still answers for the section index. A parameterised route that resolves to
 * nothing ends the search rather than falling through to its parent: an unknown slug has no card,
 * instead of the section's card under a title nobody wrote.
 */
export async function cardFor(path: string): Promise<CardContent | undefined> {
  const [matched, params] = (await router()).getMatchedRoutes(path)

  for (const route of [...matched].reverse()) {
    const { seo, seoFor } = route.options.staticData ?? {}

    if (seoFor) {
      const resolved = seoFor(params)
      return resolved && { ...resolved, section: sectionFromPath(path), variant: "post" }
    }

    if (seo) return { ...seo, section: sectionFromPath(path), variant: "post" }
  }

  return undefined
}

/**
 * Every card the site can answer for, with what goes on it. A parameterised route contributes the
 * paths it says it covers — only it knows what its params range over — and a layout and its index
 * route resolve to the same path, hence the set.
 */
export async function buildManifest(): Promise<Array<Card>> {
  const routes: Array<AnyRoute> = Object.values((await router()).routesById)
  const paths = new Set<string>()

  for (const route of routes) {
    const { seo, seoPaths } = route.options.staticData ?? {}
    if (seoPaths) for (const path of seoPaths()) paths.add(path)
    else if (seo) paths.add(normalize(route.fullPath))
  }

  const cards = (await Promise.all([...paths].map(async path => ({ path, content: await cardFor(path) })))).flatMap(
    ({ path, content }) => (content ? [{ file: ogImagePath(path), ...content }] : [])
  )
  return cards
}

/** Imported lazily rather than at the top: the router owns the route tree this file is part of. */
async function router() {
  const { getRouter } = await import("@/router")
  return getRouter()
}

function normalize(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path
}
