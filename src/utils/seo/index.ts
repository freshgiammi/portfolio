import type { StaticDataRouteOption } from "@tanstack/react-router"

import { env } from "@/env"

const TWITTER_HANDLE = "@freshgiammi"

export const TITLE_SUFFIX = / — freshgiammi$/

/**
 * What a route declares as `staticData: { seo }`. Derived from the router augmentation rather than
 * redeclared, so the shape exists in exactly one place.
 */
export type PageSeo = NonNullable<StaticDataRouteOption["seo"]>

type SeoOptions = PageSeo & {
  path: string
  type?: "website" | "article"
}

/** First path segment, title-cased, drawn at the top of the card. */
export function sectionFromPath(path: string) {
  const segment = path.split("/").find(Boolean)
  if (!segment) return "Home"
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

/** The page's own name with the site suffix stripped: what a page header renders as its heading. */
export function pageTitleFromSeo(seoTitle: string) {
  return seoTitle.replace(TITLE_SUFFIX, "")
}

/**
 * Where a page's card lives. Derived from the path alone, so the meta tag and the image agree
 * without either side keeping a list — and shaped like a file, so a card emitted ahead of time can
 * answer from the CDN at the same url the renderer would have.
 */
export function ogImagePath(path: string) {
  const normalized = path === "/" ? "/index" : path.replace(/\/$/, "")
  return `/og${normalized}.png`
}

export function getSiteUrl() {
  const envUrl = env.VITE_SITE_URL?.trim() ?? ""

  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`
  }

  if (typeof window !== "undefined") return window.location.origin
  return ""
}

function toAbsoluteUrl(path: string) {
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
