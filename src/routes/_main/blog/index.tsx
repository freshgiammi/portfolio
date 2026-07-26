import { createFileRoute, Link } from "@tanstack/react-router"
import { allPosts } from "content-collections"

import { Icon } from "@/components/ui/icons"
import { List } from "@/components/ui/list"
import { Typography } from "@/components/ui/typography"
import { env } from "@/env"
import { formatDate } from "@/utils/date"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./index.module.scss"

const SEO = {
  title: "Blog — freshgiammi",
  description: "Thoughts on software, design, and building things.",
  emoji: "✍️"
} satisfies PageSeo

type PostData = {
  slug: string
  title: string
  published: string
  description?: string
  readingTime: number
}

export const Route = createFileRoute("/_main/blog/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/blog" }),
  component: BlogIndex
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function isDev() {
  return env.NODE_ENV === "development"
}

function getVisiblePosts() {
  return (allPosts as Array<PostData>)
    .filter(post => isDev() || post.slug !== "markdown-test")
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
}

/** Rows are grouped by year, so the meta only has to carry the month and day. */
function groupByYear(posts: Array<PostData>) {
  const groups: Array<{ year: number; posts: Array<PostData> }> = []

  for (const post of posts) {
    const year = new Date(post.published).getFullYear()
    const current = groups.at(-1)
    if (current?.year === year) {
      current.posts.push(post)
    } else {
      groups.push({ year, posts: [post] })
    }
  }

  return groups
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function BlogIndex() {
  const groups = groupByYear(getVisiblePosts())

  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Typography size="x-large" family="serif">
          ✍️ Blog
        </Typography>
        <Typography size="xx-small" weight="regular" className={styles.Header__subtitle}>
          {SEO.description}
        </Typography>
      </header>

      {groups.length === 0 ? (
        <Typography size="x-small" weight="regular" className={styles.Empty}>
          No posts yet.
        </Typography>
      ) : (
        <div className={styles.Groups}>
          {groups.map(group => (
            <section key={group.year} className={styles.Group}>
              <Typography size="xxx-small" family="mono" className={styles.Group__year}>
                {group.year}
              </Typography>
              <List.Root>
                {group.posts.map(post => (
                  <List.Item
                    key={post.slug}
                    interactive
                    render={<Link to="/blog/$slug" params={{ slug: post.slug }} />}
                    title={post.title}
                    description={post.description}
                    footer={
                      <>
                        <List.MetaItem>
                          <Icon.CalendarBlankIcon size={12} />
                          <time dateTime={post.published}>{formatDate(post.published, "short")}</time>
                        </List.MetaItem>
                        <List.MetaItem>
                          <Icon.ClockIcon size={12} />
                          {post.readingTime} min read
                        </List.MetaItem>
                      </>
                    }
                  />
                ))}
              </List.Root>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
