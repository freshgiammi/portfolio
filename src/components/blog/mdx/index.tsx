import type { MDXComponents, MDXContent } from "mdx/types"
import type { JSX, MouseEvent, ReactNode } from "react"
import { Children, isValidElement } from "react"

import { Alert } from "@/components/blog/alert"
import { CodeBlock } from "@/components/blog/code-block"
import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Typography } from "@/components/primitives/typography"
import { Lightbox } from "@/components/ui/lightbox"
import { Tweet } from "@/components/ui/tweet"
import { useScrollToHeading } from "@/hooks/useScrollToHeading"

import styles from "./index.module.scss"

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const

function headingComponent(tag: (typeof HEADING_TAGS)[number]) {
  return function Heading({ id, children }: JSX.IntrinsicElements["h1"]) {
    if (!id) {
      const Plain = tag
      return <Plain>{children}</Plain>
    }
    return (
      <HeadingWithAnchor id={id} tag={tag}>
        {children}
      </HeadingWithAnchor>
    )
  }
}

const headingComponents = Object.fromEntries(HEADING_TAGS.map(tag => [tag, headingComponent(tag)]))

type MdxImageProps = {
  src?: string
  alt?: string
  title?: string
  "data-static"?: boolean
  "data-wide"?: boolean
}

/**
 * A paragraph whose only real content is one image carrying a `title` becomes a captioned figure:
 *
 * `![alt](/images/posts/post/photo.jpg "The caption")`
 *
 * Checked against `MdxImage`'s own identity rather than the intrinsic `"img"` tag, since by the
 * time this paragraph's `children` reach here, MDX has already resolved its `img` through this same
 * `components` map — the element sitting in `children` is already a `MdxImage`, never a plain `img`.
 */
function soloCaptionedImage(children: ReactNode) {
  const nonWhitespace = Children.toArray(children).filter(child => typeof child !== "string" || child.trim())
  const [only] = nonWhitespace
  if (nonWhitespace.length !== 1 || !isValidElement<MdxImageProps>(only)) return undefined
  if (only.type !== MdxImage || !only.props.title) return undefined
  return only.props
}

// Stable module-level object, not rebuilt per render: `Mdx` below only ever reads this reference.
const components: MDXComponents = {
  ...headingComponents,
  // Twitter's embed snippet pastes a `<script>` alongside its blockquote to swap it for an iframe;
  // React 19 hoists `<script async src>` into the document and would run the widget over the top of
  // the real `Tweet` component below, so every script (and any accompanying style) is dropped instead
  // of rendered.
  script: () => null,
  style: () => null,
  img: MdxImage,
  a: ProseLink,
  blockquote: ({ children, ...rest }: { children?: ReactNode; "data-tweet-id"?: string; "data-callout"?: string }) => {
    const tweetId = rest["data-tweet-id"]
    if (typeof tweetId === "string") return <Tweet id={tweetId} />

    const calloutType = rest["data-callout"]
    if (typeof calloutType === "string") {
      return <Alert type={calloutType as Alert.Props["type"]}>{children}</Alert>
    }
    return <blockquote {...rest}>{children}</blockquote>
  },
  p: ({ children, ...rest }: { children?: ReactNode; "data-tweet-id"?: string }) => {
    const tweetId = rest["data-tweet-id"]
    if (typeof tweetId === "string") return <Tweet id={tweetId} />

    const captioned = soloCaptionedImage(children)
    if (captioned) {
      return (
        <figure className={styles.Prose__figure} data-wide={captioned["data-wide"] || undefined}>
          <ProseImage src={captioned.src!} alt={captioned.alt} static={captioned["data-static"]} />
          <Typography size="x-small" family="serif" render={<figcaption />} className={styles.Prose__caption}>
            {captioned.title}
          </Typography>
        </figure>
      )
    }

    return <p {...rest}>{children}</p>
  },
  // Shiki (see `vite.config.ts`) lands `title`/`lang` fenced-meta on the `<pre>` as `data-*`; pull
  // them off here so a labeled block gets `CodeBlock`'s header, without leaking them onto the `<pre>`.
  pre: ({ children, "data-title": filename, "data-lang": language, ...rest }) => (
    <CodeBlock {...rest} filename={filename} language={language}>
      {children}
    </CodeBlock>
  )
}

type MdxProps = {
  /** The post's own compiled body — a real component, statically imported by content-collections
      (see `content-collections.ts`), not a string this app ever has to evaluate itself. */
  component: MDXContent
}

/**
 * The one way this site renders a post or thought's body: headings get anchors, images open in a
 * lightbox, code blocks scroll instead of growing the page, `[!NOTE]`-style alerts and pasted tweet
 * embeds become real components — all through this `components` map, which is the MDX-native
 * equivalent of overriding what a tag renders as. `rehypeCallouts`/`rehypeTweetEmbeds` (see
 * `vite.config.ts`, where the MDX compile pipeline is registered) do the detection at build time,
 * rewriting a marker or a link into a plain `data-*` attribute this map reads back — which is what
 * lets the overrides below stay this simple instead of re-deriving each case from already-rendered
 * children.
 */
export function Mdx({ component: Component }: MdxProps) {
  return (
    <div className={styles.Prose}>
      <Component components={components} />
    </div>
  )
}

export declare namespace Mdx {
  export type Props = MdxProps
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

/** A link to a heading's own anchor gets the same in-place, don't-scroll-if-already-visible
    treatment `HeadingWithAnchor`'s own icon does, rather than a plain jump. Everything else is a
    completely ordinary link. */
function ProseLink({ href, children, ...rest }: JSX.IntrinsicElements["a"]) {
  const hash = typeof href === "string" && href.startsWith("#") ? href.slice(1) : undefined
  const scrollToHeading = useScrollToHeading()

  return (
    <a
      href={href}
      {...rest}
      onClick={
        hash
          ? (e: MouseEvent) => {
              e.preventDefault()
              scrollToHeading(hash)
            }
          : undefined
      }>
      {children}
    </a>
  )
}

/**
 * Images open in a lightbox by default. Append the `#static` marker to the source to opt out, for
 * images with nothing to inspect up close:
 *
 * `![alt](/images/posts/post/meme.jpg#static "caption")`
 *
 * Resolved into the plain `data-static` prop below at build time, by `rehypeImageMarkers` (see
 * `src/utils/markdown/image-markers.ts`) — not re-parsed out of `src` on every render here.
 */
function MdxImage({ src, alt, "data-static": isStatic }: MdxImageProps) {
  if (typeof src !== "string") return null
  return <ProseImage src={src} alt={alt} static={isStatic} />
}

function ProseImage({ src, alt, static: isStatic }: { src: string; alt?: string; static?: boolean }) {
  const image = <Image src={src} alt={alt ?? ""} loading="lazy" layout="intrinsic" className={styles.Prose__image} />

  if (isStatic) return image

  return (
    <Lightbox src={src} alt={alt}>
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
  children: ReactNode
}) {
  const scrollToHeading = useScrollToHeading()

  return (
    <Tag id={id} className={styles.Prose__heading}>
      <span className={styles.Prose__headingText}>{children}</span>
      <a
        href={`#${id}`}
        className={styles.Prose__headingAnchor}
        onClick={e => {
          e.preventDefault()
          scrollToHeading(id)
          navigator.clipboard.writeText(window.location.href).catch(() => {})
        }}>
        <Icon.HashIcon weight="bold" />
      </a>
    </Tag>
  )
}
