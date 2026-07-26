import type { StaticDataRouteOption } from "@tanstack/react-router"

import { env } from "@/env"

const TWITTER_HANDLE = "@freshgiammi"

/**
 * What a route declares as `staticData: { seo }`. Derived from the router augmentation rather than
 * redeclared, so the shape exists in exactly one place.
 */
export type PageSeo = NonNullable<StaticDataRouteOption["seo"]>

/** Drawn for any route that declares no `seo`, so a new page is never left without a card. */
export const DEFAULT_SEO: PageSeo = {
  title: "freshgiammi",
  description: "Frontend engineering, developer tooling, and design systems.",
  emoji: "👋🏻"
}

type SeoOptions = PageSeo & {
  path: string
  type?: "website" | "article"
}

/**
 * Where the OG generator writes a page's card. Derived from the path alone, so the meta tag and the
 * generated file agree without either side keeping a list.
 */
export function ogImagePath(path: string) {
  const normalized = path === "/" ? "/index" : path.replace(/\/$/, "")
  return `/og${normalized}.png`
}

function getSiteUrl() {
  const envUrl = env.VITE_SITE_URL?.trim() ?? ""

  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`
  }

  if (typeof window !== "undefined") return window.location.origin
  return ""
}

export function toAbsoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const siteUrl = getSiteUrl()
  if (!siteUrl) return normalized
  return new URL(normalized, siteUrl).toString()
}

export function createSeoMeta({ title, description, path, type = "website" }: SeoOptions) {
  const url = toAbsoluteUrl(path)
  const image = toAbsoluteUrl(ogImagePath(path))

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "freshgiammi" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:creator", content: TWITTER_HANDLE },
      { name: "twitter:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image }
    ],
    links: [{ rel: "canonical", href: url }]
  }
}
