import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

/**
 * GitHub's alert syntax: a blockquote whose content starts with one of these markers on its own
 * line, e.g. `> [!NOTE]\n> Body text`. remark leaves that as a single paragraph with a literal
 * `\n` (a soft break, since there's no blank line to split it), so the marker and the body share
 * one text node.
 */
const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\r?\n?/

/**
 * Rewritten at the hast level: a blockquote whose first paragraph starts with `[!TYPE]` gets that
 * marker stripped and a `data-callout` property set to the lowercased type, for the `blockquote`
 * override in `src/components/blog/mdx/index.tsx` to key off. Doing the match here rather than in
 * the MDX `components` map is what lets that override read a plain data attribute instead of
 * re-parsing already-rendered children back into text.
 */
export function rehypeCallouts() {
  return (tree: Root) => {
    visit(tree, "element", node => {
      if (node.tagName !== "blockquote") return

      const firstParagraph = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "p"
      )
      const firstText = firstParagraph?.children[0]
      if (!firstParagraph || !firstText || firstText.type !== "text") return

      const match = ALERT_MARKER.exec(firstText.value)
      if (!match) return

      firstText.value = firstText.value.slice(match[0].length)
      Object.assign(node.properties, { dataCallout: match[1]!.toLowerCase() })
    })
  }
}
