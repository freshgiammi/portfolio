import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Skeleton } from "@/components/primitives/skeleton"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import { Tweet } from "@/components/ui/tweet"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"

import { ShowcaseTemplate } from "../-components/showcase-template"
import styles from "./index.module.scss"

const SUBTITLE = "Toggle the state below. It's the same card either way, never a placeholder shape."

/** The demo this is built from, and the argument it makes. */
const SOURCE_TWEET = "2040470520878313570"

/**
 * Invented, since the demo is about the shape of a card rather than about anyone in particular.
 *
 * The avatar is drawn rather than fetched: a real photograph would be a person to explain, and a
 * remote placeholder service would be a network request for a rectangle.
 */
const PERSON = {
  name: "John Doe",
  bio: "Type designer and occasional typesetter, mostly working on things that have to be read on paper first.",
  tags: ["type design", "print", "lettering"],
  avatar:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <rect width="96" height="96" fill="#b8b2ad"/>
        <circle cx="48" cy="38" r="17" fill="#8f8781"/>
        <path d="M14 96c0-19 15-31 34-31s34 12 34 31z" fill="#8f8781"/>
      </svg>`
    )
}

const SEO = {
  title: "Skeleton",
  description: "A loading skeleton that covers real components instead of standing in for them.",
  emoji: "✨"
} satisfies PageSeo

export const Route = createFileRoute("/_main/craft/skeleton/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/craft/skeleton" }),
  component: SkeletonShowcase
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function SkeletonShowcase() {
  return (
    <ShowcaseTemplate.Root>
      <ShowcaseTemplate.Header
        to="/craft/skeleton"
        subtitle={SUBTITLE}
        githubUrl="https://github.com/freshgiammi/portfolio/tree/master/src/components/primitives/skeleton"
      />

      <ShowcaseTemplate.Demo>
        <Demo />
      </ShowcaseTemplate.Demo>

      <ShowcaseTemplate.Lede>
        Most loading states are basically a second layout: a set of grey rectangles built to look like the real
        component, kept in a file right next to it, and wrong the moment either one changes. This one doesn&apos;t have
        shapes of its own at all. It takes the real component and paints directly over it, so the skeleton is that
        component&apos;s own outline, by construction, with nothing for it to drift away from.
      </ShowcaseTemplate.Lede>

      <ShowcaseTemplate.Section title="Where the idea came from">
        <ShowcaseTemplate.Prose>
          This is implemented from a demo by Devon Govett, and his core argument is worth repeating: the drift
          isn&apos;t a bug you can just be disciplined about. A title wraps, a line count changes with the copy, an
          avatar shifts by a few pixels, and suddenly the placeholder is describing a component that no longer exists.
        </ShowcaseTemplate.Prose>
        <div className={styles.Inspiration}>
          <Tweet id={SOURCE_TWEET} />
        </div>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="Covering rather than replacing">
        <ShowcaseTemplate.Prose>
          The child gets cloned, not swapped out. It keeps rendering at its real size, with its real border radius, in
          its real place in the layout, and the skeleton is painted right on top of it. Nothing has to be told how big
          anything is, since whatever&apos;s being covered is already the correct size.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Prose>
          What actually gets painted depends on what&apos;s underneath it. A lone run of text gets its own box filled
          in, since text is usually what the reader is waiting on; anything with more structure gets a pseudo-element
          laid over its whole area instead. Images and bare strings get wrapped in a span along the way, since neither
          one can carry a pseudo-element by itself.
        </ShowcaseTemplate.Prose>
      </ShowcaseTemplate.Section>

      <ShowcaseTemplate.Section title="One clock for the whole page">
        <ShowcaseTemplate.Prose>
          The sweep runs through the Web Animations API rather than a CSS keyframe, for one specific reason: every
          skeleton on the page needs to start at exactly the same time. A field of independent shimmers just reads as
          noise. One shared clock reads as a single surface with light moving across it, which is closer to what a page
          still loading actually looks like.
        </ShowcaseTemplate.Prose>
        <ShowcaseTemplate.Aside>
          Under reduced motion the sweep never starts at all, and the fill just stays put. A placeholder that&apos;s
          stopped moving is still a placeholder. One that&apos;s been removed entirely is just a layout jumping into
          place later.
        </ShowcaseTemplate.Aside>
      </ShowcaseTemplate.Section>
    </ShowcaseTemplate.Root>
  )
}

function Demo() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={styles.Demo}>
      <div className={styles.Card}>
        <Skeleton isLoading={isLoading}>
          <img src={PERSON.avatar} alt="" className={styles.Card__avatar} />
        </Skeleton>

        <div className={styles.Card__body}>
          <Skeleton isLoading={isLoading}>
            <Typography size="small" weight="semibold">
              {PERSON.name}
            </Typography>
          </Skeleton>

          <Skeleton isLoading={isLoading}>
            <Typography size="xx-small" weight="regular" className={styles.Card__bio}>
              {PERSON.bio}
            </Typography>
          </Skeleton>

          <div className={styles.Card__tags}>
            <Skeleton isLoading={isLoading}>
              {PERSON.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Skeleton>
          </div>
        </div>
      </div>

      <ShowcaseTemplate.Action
        icon={<Icon.ArrowsClockwiseIcon size={16} />}
        onClick={() => setIsLoading(current => !current)}>
        {isLoading ? "Show loaded" : "Show loading"}
      </ShowcaseTemplate.Action>
    </div>
  )
}
