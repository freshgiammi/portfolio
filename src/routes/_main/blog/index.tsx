import { createFileRoute, Link } from "@tanstack/react-router"
import { allPosts } from "content-collections"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { List } from "@/components/primitives/list"
import { Page } from "@/components/primitives/page"
import { Tooltip } from "@/components/primitives/tooltip"
import { Typography } from "@/components/primitives/typography"
import { usePostStats } from "@/query/hooks/usePostStats"
import { postStatsQueryOptions } from "@/query/options/post-stats"
import { formatDate } from "@/utils/date"
import { formatCount } from "@/utils/number"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"
import { getServerVoterId } from "@/utils/voter"

import styles from "./index.module.scss"

// TODO: We don't have much content yet, but we will definitely need to paginate or virtualize eventually, to avoid loading everything upfront.

const SEO = {
  title: "Blog — freshgiammi",
  description: "Writeups of whatever I've been building and figuring out lately.",
  emoji: "✍️"
} satisfies PageSeo

type PostData = { slug: string; title: string; published: string; description?: string; readingTime: number }

export const Route = createFileRoute("/_main/blog/")({
  // Every post's stats prefetched up front, so the likes/claps under each row (and this reader's own
  // liked state) are in the initial render instead of popping in after the fact. This route is
  // excluded from prerendering (see `vite.config.ts`) specifically so this runs fresh on every
  // request — a small personal blog, so this is a bounded handful of requests, not something worth
  // paginating around.
  loader: ({ context }) => {
    const voter = getServerVoterId()
    return Promise.all(
      getPosts().map(post => context.queryClient.ensureQueryData(postStatsQueryOptions(post.slug, voter)))
    )
  },
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/blog" }),
  component: BlogIndex
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function getPosts(): Array<PostData> {
  return (allPosts as Array<PostData>).sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
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
  const groups = groupByYear(getPosts())

  return (
    <Page.Root>
      <Page.Header
        emoji={SEO.emoji}
        title={pageTitleFromSeo(SEO.title)}
        subtitle={SEO.description}
        aside={
          <span>
            Shorter things live in <Link to="/thoughts">thoughts</Link>.
          </span>
        }
        trailing={
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant="primary"
                    size="small"
                    icon={<Icon.RssIcon />}
                    aria-label="Subscribe via RSS"
                    render={<a href="/feed.xml" />}
                  />
                }
              />
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Popup>Subscribe via RSS</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
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
                  {group.posts.map(post => (
                    <PostRow key={post.slug} post={post} />
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

type PostRowProps = { post: PostData }

function PostRow({ post }: PostRowProps) {
  const { stats } = usePostStats(post.slug)
  const isLiked = stats?.liked === true
  const isClapped = Boolean(stats && stats.myClaps > 0)

  return (
    <List.Item
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
          {Boolean(stats && stats.likes > 0) && (
            <List.MetaItem data-tone={isLiked ? "danger" : undefined}>
              <Icon.HeartIcon size={12} weight={isLiked ? "fill" : "regular"} />
              {formatCount(stats!.likes)}
            </List.MetaItem>
          )}
          {Boolean(stats && stats.claps > 0) && (
            <List.MetaItem data-tone={isClapped ? "accent" : undefined}>
              <Icon.HandsClappingIcon size={12} weight={isClapped ? "fill" : "regular"} />
              {formatCount(stats!.claps)}
            </List.MetaItem>
          )}
        </>
      }
    />
  )
}
