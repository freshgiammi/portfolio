import { createFileRoute, Link, notFound, rootRouteId } from "@tanstack/react-router"
import { cx } from "cva"

import { Icon } from "@/components/ui/icons"
import { Tag } from "@/components/ui/tag"
import { Typography } from "@/components/ui/typography"
import { formatDate } from "@/utils/date"
import { createSeoMeta } from "@/utils/seo"

import type { Thought } from "../-data/thoughts"
import { getThoughtExcerpt, getThoughts } from "../-data/thoughts"
import styles from "./index.module.scss"

/** Enough of a neighbouring thought to link to it. */
type ThoughtLink = { id: string; excerpt: string } | null

type ThoughtLoaderData = {
  thought: Thought
  newer: ThoughtLink
  older: ThoughtLink
}

export const Route = createFileRoute("/_main/thoughts/$id/")({
  loader: ({ params }): ThoughtLoaderData => {
    const thoughts = getThoughts()
    const index = thoughts.findIndex(t => t.id === params.id)
    const thought = thoughts[index]

    if (!thought) {
      throw notFound({ routeId: rootRouteId }) as Error
    }

    const toLink = (t: Thought | undefined): ThoughtLink => (t ? { id: t.id, excerpt: getThoughtExcerpt(t, 48) } : null)

    // The list runs newest first, so the neighbour after this one is the older thought.
    return { thought, newer: toLink(thoughts[index - 1]), older: toLink(thoughts[index + 1]) }
  },
  head: ({ loaderData }) => {
    // loaderData is undefined when the loader threw notFound() above.
    if (!loaderData) return {}
    const { thought } = loaderData

    return createSeoMeta({
      title: `${getThoughtExcerpt(thought)} — freshgiammi`,
      description: getThoughtExcerpt(thought, 160),
      path: `/thoughts/${thought.id}`,
      type: "article"
    })
  },
  component: ThoughtPage
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ThoughtPage() {
  const { thought, newer, older }: ThoughtLoaderData = Route.useLoaderData()

  return (
    <div className={styles.Thought}>
      <article className={styles.Thought__article}>
        <header className={styles.Thought__header}>
          <Typography size="xx-small" weight="medium" className={styles.Thought__back} render={<Link to="/thoughts" />}>
            <Icon.ArrowLeftIcon size={12} />
            All thoughts
          </Typography>

          {/* A thought has no title, so the date is the heading: it is the only thing that
              distinguishes one from another at a glance. */}
          <Typography size="medium" family="serif" render={<h1 />}>
            <time dateTime={thought.published}>{formatDate(thought.published, "long")}</time>
          </Typography>
        </header>

        <Typography size="small" weight="regular" className={styles.Thought__body}>
          {thought.body}
        </Typography>

        <Tag.List tags={thought.tags} className={styles.Thought__tags} />

        {(newer || older) && (
          <nav className={styles.Thought__neighbours} aria-label="More thoughts">
            {older && <NeighbourLink thought={older} direction="older" />}
            {newer && <NeighbourLink thought={newer} direction="newer" />}
          </nav>
        )}
      </article>
    </div>
  )
}

type NeighbourLinkProps = {
  thought: NonNullable<ThoughtLink>
  direction: "older" | "newer"
}

function NeighbourLink({ thought, direction }: NeighbourLinkProps) {
  return (
    <Link
      to="/thoughts/$id"
      params={{ id: thought.id }}
      className={cx(styles.Thought__neighbour, styles[`Thought__neighbour--${direction}`])}>
      <Typography size="xxx-small" family="mono" className={styles.Thought__neighbourLabel}>
        {direction === "older" ? "Older" : "Newer"}
      </Typography>
      <Typography size="xx-small" weight="medium" className={styles.Thought__neighbourExcerpt}>
        {thought.excerpt}
      </Typography>
    </Link>
  )
}
