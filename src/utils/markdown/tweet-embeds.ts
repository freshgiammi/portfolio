import type { Element, Root, RootContent, Text } from "hast"
import { EXIT, visit } from "unist-util-visit"

/**
 * The status id out of any tweet URL. Twitter's own embed snippet, the share link, and a plain
 * pasted link all differ in host, path and query, and agree on nothing but this.
 */
const TWEET_URL = /(?:twitter|x)\.com\/[^/\s]+\/status(?:es)?\/(\d+)/

/**
 * Raw HTML written directly in an `.mdx` document (Twitter's own embed snippet, pasted as-is) is
 * parsed as JSX rather than as an `element` hast node — `@mdx-js/mdx` passes `mdxJsxFlowElement`/
 * `mdxJsxTextElement` nodes through remark-rehype untouched, keeping mdast's `name`/`attributes`
 * shape instead of hast's `tagName`/`properties`. Markdown-native constructs (`> quoted text`, a
 * bare link on its own line) still produce plain `element` nodes, so both shapes have to be read
 * and written uniformly for tweet detection to see either kind of source equally.
 */
type TagNode = (Element | MdxJsxNode) & { children?: Array<RootContent> }

type MdxJsxAttributeValue = string | { type: string; value?: string } | null | undefined

type MdxJsxNode = {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement"
  name?: string | null
  attributes: Array<{ type: string; name?: string; value?: MdxJsxAttributeValue }>
  data?: { _mdxExplicitJsx?: boolean }
}

/**
 * A raw JSX/HTML tag written directly in the document (rather than produced by markdown syntax)
 * compiles straight to `_jsx("tagname", ...)`, bypassing the `components` map entirely — recma-jsx-
 * rewrite only substitutes `_components.tagname` for elements it considers markdown-native. Clearing
 * this flag is what lets the `blockquote`/`script`/`style` overrides in the `Mdx` component apply to
 * a pasted Twitter embed the same way they apply to markdown-native constructs.
 */
function routeThroughComponentMap(node: TagNode) {
  if (node.type !== "element" && node.data) Reflect.deleteProperty(node.data, "_mdxExplicitJsx")
}

function isTagNode(node: { type: string }): node is TagNode {
  return node.type === "element" || node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement"
}

function tagName(node: TagNode): string | undefined {
  return node.type === "element" ? node.tagName : (node.name ?? undefined)
}

function getAttribute(node: TagNode, name: string): string | undefined {
  if (node.type === "element") {
    const value = node.properties[name]
    return typeof value === "string" ? value : undefined
  }

  const attribute = node.attributes.find(attr => attr.type === "mdxJsxAttribute" && attr.name === name)
  return typeof attribute?.value === "string" ? attribute.value : undefined
}

function setDataTweetId(node: TagNode, id: string) {
  if (node.type === "element") {
    Object.assign(node.properties, { dataTweetId: id })
    return
  }
  node.attributes.push({ type: "mdxJsxAttribute", name: "data-tweet-id", value: id })
  routeThroughComponentMap(node)
}

function classNames(node: TagNode): Array<string> {
  const value = getAttribute(node, node.type === "element" ? "className" : "class")
  return value ? value.split(/\s+/) : []
}

function isWhitespaceText(node: { type: string }): node is Text {
  return node.type === "text" && !(node as Text).value.trim()
}

/** The id of the tweet a node links to, wherever in its subtree the link happens to be. */
function findTweetId(node: TagNode): string | undefined {
  let found: string | undefined

  visit(node as never, isTagNode, (child: TagNode) => {
    if (tagName(child) !== "a") return undefined

    const href = getAttribute(child, "href")
    const match = href ? TWEET_URL.exec(href) : null
    if (!match) return undefined

    found = match[1]
    return EXIT
  })

  return found
}

/**
 * Two shapes turn into the same real `Tweet` component, rewritten at the hast level for the same
 * reason `rehypeCallouts` is: `blockquote`/`p` read a plain `data-tweet-id` attribute in the MDX
 * `components` map, rather than re-deriving the id from already-rendered children.
 *
 * - Twitter's own embed snippet: a `blockquote.twitter-tweet` carrying the tweet's markup, with a
 *   `<script>` alongside it that would otherwise swap the blockquote for an iframe — dropped by the
 *   `script` override in the `components` map instead, since React 19 hoists `<script async src>`
 *   into the document and would run the widget over the top of the real component.
 * - A bare tweet URL pasted on its own line, which is a paragraph containing nothing but a link to
 *   one.
 *
 * Also routes any raw `<script>`/`<style>` tag through the component map unconditionally (see
 * `routeThroughComponentMap`), so the `Mdx` component's `script`/`style` overrides can drop
 * Twitter's `widgets.js` tag — otherwise React 19 would hoist it into the document and run the
 * widget over the top of the real `Tweet` component above.
 */
export function rehypeTweetEmbeds() {
  return (tree: Root) => {
    visit(tree as never, isTagNode, (node: TagNode) => {
      const name = tagName(node)

      if (name === "script" || name === "style") {
        routeThroughComponentMap(node)
        return
      }

      if (name === "blockquote") {
        if (!classNames(node).includes("twitter-tweet")) return

        const id = findTweetId(node)
        if (id) setDataTweetId(node, id)
        return
      }

      if (name === "p") {
        const children = node.children ?? []
        const elementChildren = children.filter((child): child is Element => isTagNode(child))
        const nonWhitespaceChildren = children.filter(child => !isWhitespaceText(child))
        if (elementChildren.length !== 1 || nonWhitespaceChildren.length !== 1) return

        const [onlyChild] = elementChildren
        if (!onlyChild || tagName(onlyChild) !== "a") return

        const href = getAttribute(onlyChild, "href")
        const match = href ? TWEET_URL.exec(href) : null
        if (match) setDataTweetId(node, match[1]!)
      }
    })
  }
}
