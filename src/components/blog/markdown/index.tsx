// eslint-disable-next-line simple-import-sort/imports
import parse, { Element, Text, type DOMNode, type HTMLReactParserOptions, domToReact } from "html-react-parser"

import { Image } from "@unpic/react"
import type { JSX } from "react"

import { Lightbox } from "@/components/generic/lightbox"
import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import type { MarkdownResult } from "@/utils/markdown"

import styles from "./index.module.scss"

type MarkdownProps = {
  result: MarkdownResult
}

function isElement(node: DOMNode): node is Element {
  return node instanceof Element
}

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"]

/** Source fragment that opts an image out of the lightbox. Fragments never reach the network. */
const STATIC_IMAGE_MARKER = "static"

export function Markdown({ result }: MarkdownProps) {
  const options: HTMLReactParserOptions = {
    replace: domNode => {
      if (isElement(domNode)) {
        if (HEADING_TAGS.includes(domNode.name)) {
          const id = domNode.attribs.id
          if (id) {
            return (
              <HeadingWithAnchor id={id} tag={domNode.name as keyof JSX.IntrinsicElements}>
                {domToReact(domNode.children as unknown as Array<DOMNode>, options)}
              </HeadingWithAnchor>
            )
          }
        }
        if (domNode.name === "a") {
          const href = domNode.attribs.href
          if (href?.startsWith("/")) {
            return <a href={href}>{domToReact(domNode.children as unknown as Array<DOMNode>, options)}</a>
          }
          if (href?.startsWith("#")) {
            return (
              <a
                href={href}
                onClick={e => {
                  e.preventDefault()
                  const id = href.slice(1)
                  // Smoothness comes from the global CSS `scroll-behavior`; the JS option
                  // silently no-ops on iOS Safari.
                  document.getElementById(id)?.scrollIntoView()
                }}>
                {domToReact(domNode.children as unknown as Array<DOMNode>, options)}
              </a>
            )
          }
        }
        if (domNode.name === "p") {
          const elementChildren = domNode.children.filter((child): child is Element => child instanceof Element)
          const hasOnlyWhitespaceText = domNode.children.every(
            child => child instanceof Element || (child instanceof Text && !child.data.trim())
          )
          const soloImg = elementChildren.length === 1 ? elementChildren[0] : undefined
          if (soloImg?.name === "img" && soloImg.attribs.title && hasOnlyWhitespaceText) {
            const { src, alt, title } = soloImg.attribs
            if (!src) return undefined
            return (
              <figure className={styles.Prose__figure}>
                <ProseImage src={src} alt={alt} />
                <Typography
                  size="x-small"
                  family="serif"
                  render={<figcaption />}
                  className={styles.Prose__caption}>
                  {title}
                </Typography>
              </figure>
            )
          }
        }
        if (domNode.name === "img") {
          const { src, alt } = domNode.attribs
          if (!src) return undefined
          return <ProseImage src={src} alt={alt} />
        }
      }
      return undefined
    }
  }

  return <div className={styles.Prose}>{parse(result.markup, options)}</div>
}

export declare namespace Markdown {
  export type Props = MarkdownProps
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

type ProseImageProps = {
  src: string
  alt?: string
}

/**
 * Images open in a lightbox by default. Append the `#static` marker to the source to opt out,
 * for images with nothing to inspect up close:
 *
 * `![alt](/images/blog/post/meme.jpg#static "caption")`
 */
function ProseImage({ src, alt }: ProseImageProps) {
  const [path = src, ...markers] = src.split("#")
  const zoomable = !markers.includes(STATIC_IMAGE_MARKER)
  const image = <Image src={path} alt={alt ?? ""} loading="lazy" layout="fullWidth" className={styles.Prose__image} />

  if (!zoomable) return image

  return (
    <Lightbox src={path} alt={alt}>
      {image}
    </Lightbox>
  )
}

function HeadingWithAnchor({
  id,
  tag: Tag,
  children
}: {
  id: string
  tag: keyof JSX.IntrinsicElements
  children: React.ReactNode
}) {
  return (
    <Tag id={id} className={styles.Prose__heading}>
      <a
        href={`#${id}`}
        className={styles.Prose__headingAnchor}
        aria-hidden="true"
        onClick={e => {
          e.preventDefault()
          const url = window.location.origin + window.location.pathname + `#${id}`
          navigator.clipboard.writeText(url).catch(() => {})
        }}>
        <Icon.LinkIcon />
      </a>
      {children}
    </Tag>
  )
}
