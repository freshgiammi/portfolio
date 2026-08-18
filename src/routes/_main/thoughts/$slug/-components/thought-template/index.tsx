import { Link } from "@tanstack/react-router"
import { cx } from "cva"

import { Mdx } from "@/components/blog/mdx"
import { ProseSkeleton } from "@/components/blog/prose-skeleton"
import { Icon } from "@/components/primitives/icons"
import { Skeleton } from "@/components/primitives/skeleton"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import { formatDate } from "@/utils/date"
import { getSettledThoughtMdx } from "@/utils/mdx/thoughts"

import styles from "./index.module.scss"

export interface Thought {
  slug: string
  published: string
  title: string
  tags: Array<string>
  excerpt: string
}

/**
 * No `use()`, no `Suspense`: the route's `loader` (see `../../index.tsx`) already awaited
 * `preloadThoughtMdx(slug)` before this template ever renders, so the settled module is always
 * already in `getSettledThoughtMdx`'s cache by now. Reading it synchronously instead of through
 * `use()` matters — `use()` forces one suspend-and-retry cycle even for an already-resolved promise,
 * which paints this component's fallback for a frame despite the data never actually being unready.
 */
function ThoughtMdxBody({ slug }: { slug: string }) {
  const MdxContent = getSettledThoughtMdx(slug)!.default
  return <Mdx component={MdxContent} />
}

/** Enough of a neighbouring thought to link to it. */
export type ThoughtLink = { slug: string; title: string } | null

type ThoughtTemplateProps = {
  thought: Thought
  newer: ThoughtLink
  older: ThoughtLink
}

export function ThoughtTemplate({ thought, newer, older }: ThoughtTemplateProps) {
  return (
    <div className={styles.Thought}>
      <article className={styles.Thought__article}>
        <header className={styles.Thought__header}>
          <Typography size="xx-small" weight="medium" className={styles.Thought__back} render={<Link to="/thoughts" />}>
            <Icon.ArrowLeftIcon size={12} />
            All thoughts
          </Typography>

          <Typography size="large" family="serif" render={<h1 />}>
            {thought.title}
          </Typography>

          <Typography size="xxx-small" family="mono" className={styles.Thought__date}>
            <time dateTime={thought.published}>{formatDate(thought.published, "long")}</time>
          </Typography>

          <div className={styles.Thought__tags}>
            {thought.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        <div className={styles.Thought__body}>
          <ThoughtMdxBody slug={thought.slug} />
        </div>

        {(newer || older) && (
          <nav className={styles.Thought__neighbours} aria-label="More thoughts">
            {older && <ThoughtNeighbourLink thought={older} direction="older" />}
            {newer && <ThoughtNeighbourLink thought={newer} direction="newer" />}
          </nav>
        )}
      </article>
    </div>
  )
}

// Mirrors `ThoughtTemplate`'s real header rather than a made-up box layout, per the `Skeleton`
// convention. Shown while the loader is still awaiting the thought's MDX chunk, so there's no title
// or date yet.
export function ThoughtTemplatePending() {
  return (
    <div className={styles.Thought}>
      <article className={styles.Thought__article}>
        <header className={styles.Thought__header} aria-hidden="true">
          <Typography size="xx-small" weight="medium" className={styles.Thought__back}>
            <Icon.ArrowLeftIcon size={12} />
            All thoughts
          </Typography>

          <Skeleton>
            <Typography size="large" family="serif" render={<h1 />}>
              Loading thought
            </Typography>
          </Skeleton>

          <Skeleton>
            <Typography size="xxx-small" family="mono" className={styles.Thought__date}>
              Loading date
            </Typography>
          </Skeleton>
        </header>

        <div className={styles.Thought__body}>
          <ProseSkeleton />
        </div>
      </article>
    </div>
  )
}

type ThoughtNeighbourLinkProps = {
  thought: NonNullable<ThoughtLink>
  direction: "older" | "newer"
}

function ThoughtNeighbourLink({ thought, direction }: ThoughtNeighbourLinkProps) {
  return (
    <Link
      to="/thoughts/$slug"
      params={{ slug: thought.slug }}
      className={cx(styles.Thought__neighbour, styles[`Thought__neighbour--${direction}`])}>
      <Typography size="xxx-small" family="mono" className={styles.Thought__neighbourLabel}>
        {direction === "older" ? "Older" : "Newer"}
      </Typography>
      <Typography size="xx-small" weight="medium" className={styles.Thought__neighbourExcerpt}>
        {thought.title}
      </Typography>
    </Link>
  )
}

export declare namespace ThoughtTemplate {
  export type Props = ThoughtTemplateProps
}
