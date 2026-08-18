import { createFileRoute, Link } from "@tanstack/react-router"
import { allThoughts } from "content-collections"

import { Icon } from "@/components/primitives/icons"
import { List } from "@/components/primitives/list"
import { Page } from "@/components/primitives/page"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import { formatDate } from "@/utils/date"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"
import { getThoughtExcerpt } from "@/utils/thought-excerpt"

import styles from "./index.module.scss"

const SEO = {
  title: "Thoughts — freshgiammi",
  description: "Short notes and stray ideas that don't need a whole blog post yet.",
  emoji: "💭"
} satisfies PageSeo

type ThoughtData = {
  slug: string
  published: string
  title: string
  tags: Array<string>
  excerpt: string
}

export const Route = createFileRoute("/_main/thoughts/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/thoughts" }),
  component: ThoughtsIndex
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function getThoughts(): Array<ThoughtData> {
  return (allThoughts as Array<ThoughtData>).sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  )
}

/** Rows are grouped by year, so the meta only has to carry the month and day. */
function groupByYear(thoughts: Array<ThoughtData>) {
  const groups: Array<{ year: number; thoughts: Array<ThoughtData> }> = []

  for (const thought of thoughts) {
    const year = new Date(thought.published).getFullYear()
    const current = groups.at(-1)
    if (current?.year === year) {
      current.thoughts.push(thought)
    } else {
      groups.push({ year, thoughts: [thought] })
    }
  }

  return groups
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

/** A scannable list rather than inline bodies: each row shows enough to decide whether to open it. */
function ThoughtsIndex() {
  const groups = groupByYear(getThoughts())

  return (
    <Page.Root>
      <Page.Header
        emoji={SEO.emoji}
        title={pageTitleFromSeo(SEO.title)}
        subtitle={SEO.description}
        aside={
          <span>
            Longer things live in the <Link to="/blog">blog</Link>.
          </span>
        }
      />

      {groups.length === 0 ? (
        <Page.Content>
          <Typography size="x-small" weight="regular" className={styles.Empty}>
            Nothing here yet, check back soon!
          </Typography>
        </Page.Content>
      ) : (
        <Page.Content>
          <div className={styles.Groups}>
            {groups.map(group => (
              <section key={group.year} className={styles.Group}>
                <Typography size="xxx-small" family="mono" className={styles.Group__year}>
                  {group.year}
                </Typography>
                <List.Root>
                  {group.thoughts.map(thought => (
                    <ThoughtRow key={thought.slug} thought={thought} />
                  ))}
                </List.Root>
              </section>
            ))}
          </div>
        </Page.Content>
      )}
    </Page.Root>
  )
}

type ThoughtRowProps = { thought: ThoughtData }

function ThoughtRow({ thought }: ThoughtRowProps) {
  return (
    <List.Item
      interactive
      render={<Link to="/thoughts/$slug" params={{ slug: thought.slug }} />}
      title={thought.title}
      description={getThoughtExcerpt(thought, 140)}
      footer={
        <List.MetaItem>
          <Icon.CalendarBlankIcon size={12} />
          <time dateTime={thought.published}>{formatDate(thought.published, "short")}</time>
        </List.MetaItem>
      }>
      <div className={styles.Row__tags}>
        {thought.tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </List.Item>
  )
}
