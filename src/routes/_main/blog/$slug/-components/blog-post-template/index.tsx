import { Link } from "@tanstack/react-router"
import { cx } from "cva"
import { useEffect, useRef, useState } from "react"

import { Mdx } from "@/components/blog/mdx"
import { PostRail } from "@/components/blog/post-rail"
import { ProseSkeleton } from "@/components/blog/prose-skeleton"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { Image } from "@/components/primitives/image"
import { Skeleton } from "@/components/primitives/skeleton"
import { Typography } from "@/components/primitives/typography"
import { usePostStats } from "@/query/hooks/usePostStats"
import { formatDate } from "@/utils/date"
import { getSettledPostMdx } from "@/utils/mdx/posts"
import { formatCount } from "@/utils/number"
import { scrollBehavior } from "@/utils/scroll"

import styles from "./index.module.scss"

export type BlogPost = {
  slug: string
  title: string
  published: string
  updated?: string | null
  description?: string
  image?: string
  headings: Array<{ id: string; text: string; level: number }>
  words: number
  readingTime: number
}

/**
 * No `use()`, no `Suspense`: the route's `loader` (see `../../index.tsx`) already awaited
 * `preloadPostMdx(slug)` before this template ever renders, so the settled module is always already
 * in `getSettledPostMdx`'s cache by now. Reading it synchronously instead of through `use()` matters
 * — `use()` forces one suspend-and-retry cycle even for an already-resolved promise, which paints
 * this component's fallback for a frame despite the data never actually being unready.
 */
function PostMdxBody({ slug }: { slug: string }) {
  const MdxContent = getSettledPostMdx(slug)!.default
  return <Mdx component={MdxContent} />
}

/** Enough of a neighbouring post to link to it, without shipping its rendered html. */
export type PostLink = { slug: string; title: string } | null

type BlogPostTemplateProps = {
  post: BlogPost
  newer: PostLink
  older: PostLink
}

export function BlogPostTemplate({ post, newer, older }: BlogPostTemplateProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 400 && currentScrollY > lastScrollY.current) {
        setShowScrollTop(true)
      } else if (currentScrollY < 200) {
        setShowScrollTop(false)
      }
      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  const isUpdated = Boolean(post.updated && post.updated !== post.published)

  // Same cached counts the rail reads, so the header costs no extra request.
  const { stats } = usePostStats(post.slug)
  const reads = stats?.reads ?? 0

  return (
    <div className={styles.BlogPost}>
      <aside className={styles.BlogPost__sidebar}>
        <TableOfContents headings={post.headings} />
        <PostRail title={post.title} slug={post.slug} className={styles.BlogPost__rail} />
      </aside>

      <article className={styles.BlogPost__article}>
        <header className={styles.BlogPost__header}>
          <Link to="/blog" className={styles.BlogPost__back}>
            <Icon.ArrowLeftIcon size={12} />
            <Typography size="xx-small" weight="medium" render={<span />}>
              All posts
            </Typography>
          </Link>

          <Typography size="xx-large" family="serif" render={<h1 />} className={styles.BlogPost__title}>
            {post.title}
          </Typography>

          {post.description && (
            <Typography size="x-small" weight="regular" className={styles.BlogPost__description}>
              {post.description}
            </Typography>
          )}

          <Typography size="xx-small" weight="regular" className={styles.BlogPost__meta}>
            <time dateTime={post.published}>{formatDate(post.published, "long")}</time>
            <MetaSeparator />
            <span>{formatCount(post.words)} words</span>
            <MetaSeparator />
            <span className={styles.BlogPost__metaItem}>
              <Icon.ClockIcon size={12} />
              {post.readingTime} min read
            </span>
            {isUpdated && post.updated && (
              <>
                <MetaSeparator />
                <span className={cx(styles.BlogPost__metaItem, styles.BlogPost__metaUpdated)}>
                  <Icon.ArrowClockwiseIcon size={12} />
                  Updated {formatDate(post.updated)}
                </span>
              </>
            )}
            {/* Last, so arriving after the counts land appends to the line rather than reflowing
                  what is already on it. */}
            {reads > 0 && (
              <>
                <MetaSeparator />
                <span className={styles.BlogPost__metaItem}>
                  <Icon.EyeIcon size={12} />
                  {formatCount(reads)} {reads === 1 ? "read" : "reads"}
                </span>
              </>
            )}
          </Typography>
        </header>

        {post.image && (
          <Image src={post.image} alt="" loading="eager" layout="intrinsic" className={styles.BlogPost__image} />
        )}

        <div className={styles.BlogPost__content}>
          <PostMdxBody slug={post.slug} />
        </div>

        {/* The sidebar is gone below its breakpoint, so the same rail follows the article there
              instead — one instance visible at a time, both reading the same cached counts. */}
        <PostRail title={post.title} slug={post.slug} className={styles.BlogPost__railInline} />

        {(newer || older) && (
          <nav className={styles.BlogPost__neighbours} aria-label="More posts">
            {older && <PostNeighbourLink post={older} direction="older" />}
            {newer && <PostNeighbourLink post={newer} direction="newer" />}
          </nav>
        )}
      </article>
      <div className={styles.BlogPost__scrollTop} data-visible={showScrollTop}>
        <Button
          icon={<Icon.ArrowUpIcon />}
          variant="secondary"
          behaviour="neutral"
          size="large"
          onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
          aria-label="Scroll to top"
        />
      </div>
    </div>
  )
}

// Mirrors `BlogPostTemplate`'s real header rather than a made-up box layout, per the `Skeleton`
// convention. Sidebar left out: the grid's tracks are fixed widths, so omitting it costs no layout
// shift once the real page mounts.
export function BlogPostTemplatePending() {
  return (
    <div className={styles.BlogPost}>
      <article className={styles.BlogPost__article}>
        <header className={styles.BlogPost__header} aria-hidden="true">
          <Typography size="xx-small" weight="medium" render={<span />} className={styles.BlogPost__back}>
            <Icon.ArrowLeftIcon size={12} />
            All posts
          </Typography>

          <Skeleton>
            <Typography size="xx-large" family="serif" render={<h1 />} className={styles.BlogPost__title}>
              Loading post
            </Typography>
          </Skeleton>

          <Skeleton>
            <Typography size="xx-small" weight="regular" className={styles.BlogPost__meta}>
              Loading post meta
            </Typography>
          </Skeleton>
        </header>

        <div className={styles.BlogPost__content}>
          <ProseSkeleton />
        </div>
      </article>
    </div>
  )
}

/** A visible `/` between meta values, kept out of the accessible name. */
function MetaSeparator() {
  return (
    <span aria-hidden="true" className={styles.BlogPost__metaSeparator}>
      /
    </span>
  )
}

type PostNeighbourLinkProps = {
  post: NonNullable<PostLink>
  direction: "older" | "newer"
}

function PostNeighbourLink({ post, direction }: PostNeighbourLinkProps) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={cx(styles.BlogPost__neighbour, styles[`BlogPost__neighbour--${direction}`])}>
      <Typography size="xxx-small" family="mono" className={styles.BlogPost__neighbourLabel}>
        {direction === "older" ? "Older" : "Newer"}
      </Typography>
      <Typography size="x-small" weight="medium" className={styles.BlogPost__neighbourTitle}>
        {post.title}
      </Typography>
    </Link>
  )
}

export declare namespace BlogPostTemplate {
  export type Props = BlogPostTemplateProps
}
