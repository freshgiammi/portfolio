import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router"
import { allPosts } from "content-collections"
import { cx } from "cva"
import { useEffect, useRef, useState } from "react"

import { Markdown } from "@/components/blog/markdown"
import { ReadCount } from "@/components/blog/read-count"
import { Share } from "@/components/blog/share"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import { env } from "@/env"
import { formatDate } from "@/utils/date"
import type { MarkdownResult } from "@/utils/markdown"
import { createSeoMeta, toAbsoluteUrl } from "@/utils/seo"

import styles from "./index.module.scss"

export interface BlogPost {
  slug: string
  title: string
  published: string
  updated?: string | null
  description?: string
  image?: string
  html: string
  headings: Array<{ id: string; text: string; level: number }>
  words: number
  readingTime: number
}

/** Enough of a neighbouring post to link to it, without shipping its rendered html. */
type PostLink = { slug: string; title: string } | null

type BlogPostLoaderData = {
  post: BlogPost
  newer: PostLink
  older: PostLink
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function isDev() {
  return env.NODE_ENV === "development"
}

export const Route = createFileRoute("/_main/blog/$slug/")({
  loader: ({ params }): BlogPostLoaderData => {
    const posts: Array<BlogPost> = allPosts
    if (!isDev() && params.slug === "markdown-test") {
      throw notFound({ routeId: rootRouteId }) as Error
    }
    const post = posts.find(p => p.slug === params.slug)
    if (!post) {
      throw notFound({ routeId: rootRouteId }) as Error
    }

    const visible = posts
      .filter(p => isDev() || p.slug !== "markdown-test")
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    const index = visible.findIndex(p => p.slug === post.slug)
    const toLink = (p: BlogPost | undefined): PostLink => (p ? { slug: p.slug, title: p.title } : null)

    // The list runs newest first, so the neighbour after this one is the older post.
    return { post, newer: toLink(visible[index - 1]), older: toLink(visible[index + 1]) }
  },
  head: ({ loaderData }) => {
    // loaderData is undefined when the loader threw notFound() above.
    // TODO: remove this guard once TanStack Router ships its upcoming loader/head
    // data-matching change (head shouldn't run against stale/absent loaderData at all).
    if (!loaderData) return {}
    const { post } = loaderData
    const description = post.description ?? "A post on freshgiammi.dev about software and frontend engineering."
    return {
      ...createSeoMeta({
        title: `${post.title} — freshgiammi`,
        description,
        path: `/blog/${post.slug}`,
        type: "article"
      })
    }
  },
  component: BlogPost
})

function BlogPost() {
  const { post, newer, older }: BlogPostLoaderData = Route.useLoaderData()

  const rendered: MarkdownResult = {
    markup: post.html,
    headings: post.headings
  }

  const [showScrollTop, setShowScrollTop] = useState(false)
  const lastScrollY = useRef(0)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The progress bar is written straight to the DOM rather than held in state, so a scroll does
    // not re-render the article.
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, currentScrollY / scrollable)) : 0
      progressRef.current?.style.setProperty("--blog-post-progress", String(ratio))

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

  return (
    <>
      <div className={styles.BlogPost__progressTrack} aria-hidden="true">
        <div ref={progressRef} className={styles.BlogPost__progressBar} />
      </div>

      <div className={styles.BlogPost}>
        <aside className={styles.BlogPost__toc}>
          <TableOfContents headings={rendered.headings} />
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
              <span>{post.words.toLocaleString()} words</span>
              <MetaSeparator />
              <span className={styles.BlogPost__metaItem}>
                <Icon.ClockIcon size={12} />
                {post.readingTime} min read
              </span>
              <ReadCount slug={post.slug} className={styles.BlogPost__metaItem} separator={<MetaSeparator />} />
              {isUpdated && post.updated && (
                <>
                  <MetaSeparator />
                  <span className={cx(styles.BlogPost__metaItem, styles.BlogPost__metaUpdated)}>
                    <Icon.ArrowClockwiseIcon size={12} />
                    Updated {formatDate(post.updated)}
                  </span>
                </>
              )}
            </Typography>
          </header>

          <div className={styles.BlogPost__content}>
            <Markdown result={rendered} />
          </div>

          {(newer || older) && (
            <nav className={styles.BlogPost__neighbours} aria-label="More posts">
              {older && <NeighbourLink post={older} direction="older" />}
              {newer && <NeighbourLink post={newer} direction="newer" />}
            </nav>
          )}
        </article>

        <aside className={styles.BlogPost__aside}>
          <Share url={toAbsoluteUrl(`/blog/${post.slug}`)} title={post.title} />
        </aside>
      </div>

      <button
        type="button"
        className={cx(styles.BlogPost__scrollTop, showScrollTop && styles["BlogPost__scrollTop--visible"])}
        // Smoothness comes from the global CSS `scroll-behavior`; the JS option silently
        // no-ops on iOS Safari.
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label="Scroll to top">
        <Icon.ArrowUpIcon size={16} />
      </button>
    </>
  )
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

/** A visible `/` between meta values, kept out of the accessible name. */
function MetaSeparator() {
  return (
    <span aria-hidden="true" className={styles.BlogPost__metaSeparator}>
      /
    </span>
  )
}

type NeighbourLinkProps = {
  post: NonNullable<PostLink>
  direction: "older" | "newer"
}

function NeighbourLink({ post, direction }: NeighbourLinkProps) {
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
