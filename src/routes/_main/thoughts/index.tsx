import { createFileRoute, Link } from "@tanstack/react-router"

import { Icon } from "@/components/ui/icons"
import { List } from "@/components/ui/list"
import { Tag } from "@/components/ui/tag"
import { Typography } from "@/components/ui/typography"
import { formatDate } from "@/utils/date"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { getThoughts } from "./-data/thoughts"
import styles from "./index.module.scss"

const SEO = {
  title: "Thoughts — freshgiammi",
  description: "Short notes: half-formed ideas, things I learned, opinions I may regret.",
  emoji: "💭"
} satisfies PageSeo

export const Route = createFileRoute("/_main/thoughts/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/thoughts" }),
  component: ThoughtsPage
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function ThoughtsPage() {
  const thoughts = getThoughts()

  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Typography size="x-large" family="serif">
          💭 Thoughts
        </Typography>
        <Typography size="xx-small" weight="regular" className={styles.Header__subtitle}>
          {SEO.description}
        </Typography>
      </header>

      {thoughts.length === 0 ? (
        <Typography size="x-small" weight="regular" className={styles.Empty}>
          No thoughts, head empty. In the meantime, the longer pieces live on the{" "}
          <Link to="/blog" className={styles.InlineLink}>
            blog
          </Link>
          .
        </Typography>
      ) : (
        <List.Root className={styles.Feed}>
          {thoughts.map(thought => (
            <List.Item
              key={thought.id}
              interactive
              render={<Link to="/thoughts/$id" params={{ id: thought.id }} />}
              footer={
                <List.MetaItem>
                  <Icon.CalendarBlankIcon size={12} />
                  <time dateTime={thought.published}>{formatDate(thought.published)}</time>
                </List.MetaItem>
              }>
              <Typography size="x-small" weight="regular" className={styles.Feed__body} truncate={1}>
                {thought.body}
              </Typography>
              <Tag.List tags={thought.tags} className={styles.Feed__tags} />
            </List.Item>
          ))}
        </List.Root>
      )}
    </div>
  )
}
