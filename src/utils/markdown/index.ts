import type { Element } from "hast"
import { toString } from "hast-util-to-string"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { visit } from "unist-util-visit"

export type MarkdownHeading = {
  id: string
  text: string
  level: number
}

/**
 * The headings a post's body will render, without compiling it: `@mdx-js/rollup` compiles the real
 * component as part of Vite's own build (see `vite.config.ts`), and there's no hook into that pass
 * to also read a side value back out of it. Run as a separate, plain
 * markdown→hast pass instead — cheap, since it skips Shiki entirely — trusting that `rehype-slug`
 * assigns the same id to the same heading text both here and in the real compile, which is what
 * lets `TableOfContents`'s `#id` links land on the heading the real render actually produced.
 */
export async function extractHeadings(content: string): Promise<Array<MarkdownHeading>> {
  const headings: Array<MarkdownHeading> = []

  // `.run()` rather than `.process()`: there's no stringify step, since nothing here needs the
  // rendered output back, and `.process()` refuses to work without a compiler plugin to produce one.
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug)
  const tree = await processor.run(processor.parse(content))

  visit(tree, "element", (node: Element) => {
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
      headings.push({
        id: node.properties.id?.toString() ?? "",
        text: toString(node),
        level: Number.parseInt(node.tagName.charAt(1), 10)
      })
    }
  })

  return headings
}
