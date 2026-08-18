import { TITLE_SUFFIX } from "@/utils/seo"

/** Falls back to the last URL segment when a route has no usable SEO title yet. */
export function humanizeSegment(pathname: string): string {
  const last = pathname.split("/").filter(Boolean).at(-1) ?? ""
  return last.replace(/-/g, " ").replace(/^\w/, char => char.toUpperCase())
}

/** Every route's `<title>` already reads "X — freshgiammi"; the label is just the "X" part. */
export function labelFromSeoTitle(pathname: string, title: string | undefined): string {
  if (pathname === "/") return "Home"
  if (!title) return humanizeSegment(pathname)
  return title.replace(TITLE_SUFFIX, "") || humanizeSegment(pathname)
}
