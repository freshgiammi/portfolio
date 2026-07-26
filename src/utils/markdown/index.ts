import rehypeShiki from "@shikijs/rehype"
import type { Element } from "hast"
import { toString } from "hast-util-to-string"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
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

export type MarkdownResult = {
  markup: string
  headings: Array<MarkdownHeading>
}

export async function renderMarkdown(content: string): Promise<MarkdownResult> {
  const headings: Array<MarkdownHeading> = []

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeShiki, {
      themes: {
        light: "vesper",
        dark: "vesper"
      }
    })
    .use(() => tree => {
      visit(tree, "element", (node: Element) => {
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
          headings.push({
            id: node.properties.id?.toString() ?? "",
            text: toString(node),
            level: Number.parseInt(node.tagName.charAt(1), 10)
          })
        }
      })
    })
    .use(rehypeStringify)
    .process(content)

  return {
    markup: String(result),
    headings
  }
}
