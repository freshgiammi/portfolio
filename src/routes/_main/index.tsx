import { createFileRoute, Link } from "@tanstack/react-router"
import { cx } from "cva"
import type { ReactNode } from "react"
import { staticAssets } from "virtual:static-assets"

import { useParticles } from "@/components/effects/particles"
import { Icon } from "@/components/primitives/icons"
import { List } from "@/components/primitives/list"
import { Typography } from "@/components/primitives/typography"
import { FindTile } from "@/components/ui/find-tile"
import { PolaroidStack } from "@/components/ui/polaroid-stack"
import type { Find } from "@/data/finds"
import { latestFinds } from "@/data/finds"
import { REVEAL_BAND } from "@/hooks/useRevealedWithoutHover"
import { usePostStats } from "@/query/hooks/usePostStats"
import { contributionsQueryOptions, milestonesQueryOptions } from "@/query/options/github-contributions"
import { activityQueryOptions } from "@/query/options/latest-activity"
import { postStatsQueryOptions } from "@/query/options/post-stats"
import type { PostSummary } from "@/server/latest-posts"
import { getLatestPosts } from "@/server/latest-posts"
import { formatDate } from "@/utils/date"
import { formatCount } from "@/utils/number"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"
import { getServerVoterId } from "@/utils/voter"

import { GithubContributions } from "./-components/github-contributions"
import { LatestActivity } from "./-components/latest-activity"
import { Wave } from "./-components/wave"
import styles from "./index.module.scss"
import { Route as WorkRoute } from "./work"

const WORK_EMOJI = WorkRoute.options.staticData!.seo!.emoji

const SOCIAL_LINKS = [
  {
    href: "https://github.com/freshgiammi",
    label: "GitHub",
    handle: "@freshgiammi",
    icon: Icon.GithubLogoIcon
  },
  {
    href: "https://x.com/freshgiammi",
    label: "X (Twitter)",
    handle: "@freshgiammi",
    icon: Icon.XLogoIcon
  }
] as const

const FINDS_SHOWN = 4

const HOME_PHOTOS: Array<PolaroidStack.Photo> = [
  { src: staticAssets("images/me.jpg"), caption: "Turin, post-debug team dinner" },
  { src: staticAssets("images/about/photo-04.jpg"), caption: "Poolside, enjoying company provided drinks" },
  { src: staticAssets("images/about/photo-12.jpg"), caption: "Cooking something up (not sober enough to remember)" }
]

const SEO = {
  title: "freshgiammi",
  description:
    "My little corner of the internet: a personal portfolio and blog, home to the things I build, write, and find interesting.",
  emoji: "👋🏻"
} satisfies PageSeo

export const Route = createFileRoute("/_main/")({
  loader: async ({ context }) => {
    const latestPosts = await getLatestPosts()
    const voter = getServerVoterId()
    // Prefetched so the likes/claps under each row, the GitHub calendar/streak, and the activity
    // feed are all in the initial render rather than popping in once their own client-side fetches
    // resolve — safe here specifically because this route is excluded from prerendering, so it runs
    // fresh on every request rather than baking any of this into a static file.
    await Promise.all([
      ...latestPosts.map(post => context.queryClient.ensureQueryData(postStatsQueryOptions(post.slug, voter))),
      context.queryClient.ensureQueryData(contributionsQueryOptions()),
      context.queryClient.ensureQueryData(milestonesQueryOptions()),
      context.queryClient.ensureQueryData(activityQueryOptions())
    ])

    return {
      recentFinds: latestFinds(FINDS_SHOWN),
      latestPosts
    }
  },
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/" }),
  component: Home
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function Home() {
  const { recentFinds, latestPosts } = Route.useLoaderData()

  const particle = useParticles({
    drift: 75,
    rise: 20,
    tilt: 30,
    wander: 0.15,
    size: "x-small"
  })

  /** A handful off the link being pointed at, of whatever that link wears. */
  const handfulFrom =
    (content: ReactNode) =>
    (e: React.PointerEvent<HTMLAnchorElement>) =>
      [...Array(4)].forEach(() => particle.emit(content, { from: e.currentTarget }))

  return (
    <div className={styles.Home}>
      <main className={styles.Home__main}>
        <section className={styles.Home__hero}>
          <div className={styles.Home__heroText}>
            <Typography size="xx-large" family="serif" className={styles.Home__heroTitle}>
              <Wave>👋🏻</Wave> Hi, I&apos;m <em className={styles.Home__heroTitleAccent}>Giammi</em>.
            </Typography>

            <Typography size="small" weight="regular" className={styles.Home__heroBio}>
              <b>Senior Software Engineer</b> at{" "}
              <a
                href="https://arduino.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.Home__chipLink}
                onPointerEnter={handfulFrom(
                  <img src={staticAssets("images/arduino-logo.svg")} alt="" style={{ width: "1.5em" }} />
                )}>
                <img src={staticAssets("images/arduino-logo.svg")} alt="" className={styles.Home__chipIcon} />
                <span className={styles.Home__chipLabel}>Arduino</span>
              </a>
              , where I <span className={styles.Home__subtle}>lead development</span> on{" "}
              <a
                href="https://cloud.arduino.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.Home__chipLink}
                onPointerEnter={handfulFrom(`☁️`)}>
                <span aria-hidden="true" className={styles.Home__chipIcon} data-emoji>
                  ☁️
                </span>
                <span className={styles.Home__chipLabel}>Arduino Cloud</span>
              </a>
              , our internal design system, and a few other things quietly running behind the scenes.
            </Typography>
            <Typography size="small" weight="regular" className={styles.Home__heroBio}>
              Away from{" "}
              <Link to="/work" className={styles.Home__chipLink} onPointerEnter={handfulFrom(WORK_EMOJI)}>
                <span aria-hidden="true" className={styles.Home__chipIcon} data-emoji>
                  {WORK_EMOJI}
                </span>
                <span className={styles.Home__chipLabel}>work</span>
              </Link>{" "}
              I&apos;m usually out with <span className={styles.Home__subtle}>a film camera</span>, deep in a game, or
              a few espresso attempts into chasing <span className={styles.Home__subtle}>one perfect shot</span>. ☕️
            </Typography>
            <Typography size="small" weight="regular" className={styles.Home__heroBio}>
              And this is my <span className={styles.Home__subtle}>little corner of the internet</span>, where I
              share the things I build, write, and find interesting.
            </Typography>

            <Socials />
          </div>

          <div className={styles.Home__photoFrame}>
            <PolaroidStack photos={HOME_PHOTOS} />
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className={styles.Home__section}>
            <div className={styles.Home__sectionHeader}>
              <Typography size="xxx-small" family="mono" weight="regular" className={styles.Home__sectionLabel}>
                Latest posts
              </Typography>
              <Link to="/blog" className={styles.Home__sectionLink}>
                <Typography size="xxx-small" family="mono" weight="regular" render={<span />}>
                  All posts
                </Typography>
                <Icon.ArrowRightIcon size={10} />
              </Link>
            </div>

            <PostList posts={latestPosts} />
          </section>
        )}

        <GithubActivitySection />
        <FindsGrid finds={recentFinds} />
      </main>
    </div>
  )
}

type PostListProps = { posts: Array<PostSummary> }

function PostList({ posts }: PostListProps) {
  return (
    <List.Root>
      {posts.map(post => (
        <HomePostRow key={post.slug} post={post} />
      ))}
    </List.Root>
  )
}

type HomePostRowProps = { post: PostSummary }

function HomePostRow({ post }: HomePostRowProps) {
  const { stats } = usePostStats(post.slug)
  const isLiked = stats?.liked === true
  const isClapped = Boolean(stats && stats.myClaps > 0)

  return (
    <List.Item
      interactive
      render={<Link to="/blog/$slug" params={{ slug: post.slug }} />}
      title={post.title}
      footer={
        <>
          <List.MetaItem>
            <Icon.CalendarBlankIcon size={12} />
            <time dateTime={post.published}>{formatDate(post.published)}</time>
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

function Socials() {
  return (
    <div className={styles.Home__socials}>
      {SOCIAL_LINKS.map(social => {
        const SocialIcon = social.icon
        const isExternal = social.href.startsWith("http")

        return (
          <span key={social.label} className={styles.Home__socialItem}>
            <a
              href={social.href}
              className={styles.Home__socialLink}
              {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}>
              <SocialIcon size={14} className={styles.Home__socialIcon} />
              <Typography size="xx-small" weight="medium" render={<span />}>
                {social.label}
              </Typography>
            </a>
          </span>
        )
      })}
    </div>
  )
}

/** The activity feed on the left and the contribution graph on the right share one header and one capped height, so the pair reads as a single block and never pushes the page tall on its own. */
function GithubActivitySection() {
  return (
    <section className={cx(styles.Home__section, styles.Home__githubSection)}>
      <div className={styles.Home__sectionHeader}>
        <Typography size="xxx-small" family="mono" weight="regular" className={styles.Home__sectionLabel}>
          On GitHub
        </Typography>
        <a
          href="https://github.com/freshgiammi"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.Home__sectionLink}>
          <Typography size="xxx-small" family="mono" weight="regular" render={<span />}>
            Profile
          </Typography>
          <Icon.ArrowRightIcon size={10} />
        </a>
      </div>

      <div className={styles.Home__githubActivityGrid}>
        <GithubContributions className={styles.Home__githubContributions} />
        <LatestActivity className={styles.Home__latestActivity} />
      </div>
    </section>
  )
}

type FindsGridProps = { finds: Array<Find> }

function FindsGrid({ finds }: FindsGridProps) {
  return (
    <section className={styles.Home__section}>
      <div className={styles.Home__sectionHeader}>
        <Typography size="xxx-small" family="mono" weight="regular" className={styles.Home__sectionLabel}>
          Finds
        </Typography>
        <Link to="/finds" className={styles.Home__sectionLink}>
          <Typography size="xxx-small" family="mono" weight="regular" render={<span />}>
            All finds
          </Typography>
          <Icon.ArrowRightIcon size={10} />
        </Link>
      </div>

      {/* A handful alongside the rest of the page, not a full page of them, so they don't each fire
          their own reveal as the reader scrolls past on the way to somewhere else. */}
      <div className={styles.Home__findsGrid}>
        {finds.map(find => (
          <FindTile key={find.id} find={find} revealBand={REVEAL_BAND.group} />
        ))}
      </div>
    </section>
  )
}
