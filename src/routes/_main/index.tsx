import { createFileRoute, Link } from "@tanstack/react-router"
import { allPosts } from "content-collections"

import { LatestActivity } from "@/components/generic/latest-activity"
import { PolaroidStack } from "@/components/generic/polaroid-stack"
import { Icon } from "@/components/ui/icons"
import { List } from "@/components/ui/list"
import { Typography } from "@/components/ui/typography"
import { env } from "@/env"
import { formatDate } from "@/utils/date"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import styles from "./index.module.scss"

const SOCIAL_LINKS = [
  {
    href: "https://github.com/freshgiammi",
    label: "GitHub",
    handle: "@freshgiammi",
    icon: Icon.GithubLogoIcon
  },
  {
    href: "https://www.linkedin.com/in/gianmarco-rengucci/",
    label: "LinkedIn",
    handle: "gianmarco-rengucci",
    icon: Icon.LinkedinLogoIcon
  },
  {
    href: "mailto:hello@freshgiammi.dev",
    label: "Email",
    handle: "hello@freshgiammi.dev",
    icon: Icon.EnvelopeSimpleIcon
  }
] as const

const LATEST_POSTS_COUNT = 3

type PostSummary = {
  slug: string
  title: string
  published: string
  readingTime: number
}

function getLatestPosts() {
  return (allPosts as Array<PostSummary>)
    .filter(post => env.NODE_ENV === "development" || post.slug !== "markdown-test")
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, LATEST_POSTS_COUNT)
}

const HOME_PHOTOS: Array<PolaroidStack.Photo> = [
  { src: "images/me.jpg", caption: "Turin, post-debug team dinner" },
  { src: "images/about/photo-04.jpg", caption: "Poolside, enjoying company provided drinks" },
  { src: "images/about/photo-12.jpg", caption: "Cooking something up (not sober enough to remember)" }
]

const SEO = {
  title: "freshgiammi",
  description: "Senior software engineer focused on frontend engineering, developer tooling, and design systems.",
  emoji: "👋🏻"
} satisfies PageSeo

export const Route = createFileRoute("/_main/")({
  loader: () => ({
    initialPhotoIndex: Math.floor(Math.random() * HOME_PHOTOS.length)
  }),
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
  const { initialPhotoIndex } = Route.useLoaderData()
  const latestPosts = getLatestPosts()

  return (
    <div className={styles.Home}>
      <main className={styles.Home__main}>
        <section className={styles.Home__hero}>
          <div className={styles.Home__photoFrame}>
            <PolaroidStack photos={HOME_PHOTOS} initialTopIndex={initialPhotoIndex} />
          </div>

          <div className={styles.Home__heroText}>
            <Typography size="xx-large" family="serif" className={styles.Home__heroTitle}>
              <span className={styles.Home__wave} aria-hidden="true">
                👋🏻
              </span>{" "}
              Hi, I&apos;m <em className={styles.Home__heroTitleAccent}>Giammi</em>.
            </Typography>

            <Typography size="small" weight="regular" className={styles.Home__heroBio}>
              I&apos;m <strong>Gianmarco</strong>, a Senior Software Engineer at{" "}
              <a
                href="https://arduino.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.Home__inlineLink}>
                Arduino
              </a>
              , and I love building <strong>polished user interfaces</strong>.
            </Typography>
            <Typography size="small" weight="regular" className={styles.Home__heroBio}>
              As well as{" "}
              <Link to="/work" className={styles.Home__inlineLink}>
                frontend engineering
              </Link>{" "}
              and <strong>developer tooling</strong>, you can find me tinkering with hardware, taking photos, or hunting
              for a good espresso. ☕
            </Typography>

            <LatestActivity />
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className={styles.Home__section}>
            <div className={styles.Home__sectionHeader}>
              <Typography size="small" family="serif" className={styles.Home__sectionLabel}>
                <em>Latest posts</em>
              </Typography>
              <Link to="/blog" className={styles.Home__sectionLink}>
                <Typography size="xx-small" weight="medium" render={<span />}>
                  All posts
                </Typography>
                <Icon.ArrowRightIcon size={12} />
              </Link>
            </div>

            <PostList posts={latestPosts} />
          </section>
        )}

        <section className={styles.Home__section}>
          <Typography size="small" family="serif" className={styles.Home__sectionLabel}>
            <em>Say hello</em>
          </Typography>
          <div className={styles.Home__sayHello}>
            <Typography size="small" weight="regular" className={styles.Home__bodyText}>
              I&apos;m always open to interesting conversations, whether about developer tooling, open source, or new
              opportunities. You can also read more{" "}
              <Link to="/about" className={styles.Home__inlineLink}>
                about me
              </Link>
              .
            </Typography>

            <Socials />
          </div>
        </section>
      </main>
    </div>
  )
}

function PostList({ posts }: { posts: Array<PostSummary> }) {
  return (
    <List.Root>
      {posts.map(post => (
        <List.Item
          key={post.slug}
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
            </>
          }
        />
      ))}
    </List.Root>
  )
}

function Socials() {
  return (
    <div className={styles.Home__socials}>
      {SOCIAL_LINKS.map(social => {
        const SocialIcon = social.icon
        const isExternal = social.href.startsWith("http")

        return (
          <a
            key={social.label}
            href={social.href}
            className={styles.Home__socialLink}
            {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}>
            <SocialIcon size={16} className={styles.Home__socialIcon} />
            <Typography size="xx-small" weight="medium" render={<span />}>
              {social.label}
            </Typography>
            <Typography size="xx-small" weight="regular" render={<span />} className={styles.Home__socialHandle}>
              {social.handle}
            </Typography>
          </a>
        )
      })}
    </div>
  )
}
