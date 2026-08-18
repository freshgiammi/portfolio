import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

/** Appended to an image's markdown source as a URL fragment, so a plain `![]()` can still say
    "nothing to inspect up close" without a second syntax for it. */
const STATIC_MARKER = "static"

/** Same mechanism, for a captioned image that's a diagram or screenshot rather than a photo: the
    `figure` it renders into normally caps at aside width, since most captions are asides, not the
    point of the page. This one opts out of the cap instead of out of the lightbox. */
const WIDE_MARKER = "wide"

/**
 * Resolved once here rather than re-split out of `src` on every render (the `img` override in the
 * `Mdx` component's `components` map reads the plain `data-static`/`data-wide` booleans back
 * instead), the same division of labour as `rehypeCallouts`/`rehypeTweetEmbeds`: markdown syntax is
 * a build-time concern, not something a presentational component re-derives.
 *
 * `![alt](/images/posts/post/meme.jpg#static "caption")`
 * `![alt](/images/posts/post/diagram.png#wide "caption")`
 */
export function rehypeImageMarkers() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return

      const src = node.properties.src
      if (typeof src !== "string" || !src.includes("#")) return

      const [path, ...markers] = src.split("#")
      if (!markers.some(marker => marker === STATIC_MARKER || marker === WIDE_MARKER)) return

      Object.assign(node.properties, {
        src: path,
        ...(markers.includes(STATIC_MARKER) && { dataStatic: true }),
        ...(markers.includes(WIDE_MARKER) && { dataWide: true })
      })
    })
  }
}
