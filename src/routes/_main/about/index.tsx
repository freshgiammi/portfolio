import { createFileRoute, Link } from "@tanstack/react-router"
import { staticAssets } from "virtual:static-assets"

import { Page } from "@/components/primitives/page"
import { Tag } from "@/components/primitives/tag"
import { Typography } from "@/components/primitives/typography"
import { PolaroidStack } from "@/components/ui/polaroid-stack"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta, pageTitleFromSeo } from "@/utils/seo"

import { EquipmentSection } from "./-components/equipment-section"
import styles from "./index.module.scss"

const SEO = {
  title: "About — freshgiammi",
  description: "Who I am and what I get up to away from the keyboard.",
  emoji: "🙋🏻‍♂️"
} satisfies PageSeo

export const Route = createFileRoute("/_main/about/")({
  staticData: { seo: SEO },
  head: () => createSeoMeta({ ...SEO, path: "/about" }),
  component: AboutPage
})

const HOBBIES = [
  { icon: "🐧", label: "Linux" },
  { icon: "🔌", label: "Hardware Tinkering" },
  { icon: "☕️", label: "Coffee" },
  { icon: "🌐", label: "Open Source" },
  { icon: "📷", label: "Photography" }
]

const ABOUT_PHOTOS: Array<PolaroidStack.Photo> = [
  { src: staticAssets("images/about/photo-01.jpg"), caption: "Somewhere underground, ears ringing" },
  { src: staticAssets("images/about/photo-03.jpg"), caption: "The usual crowd, film edition" },
  { src: staticAssets("images/about/photo-04.jpg"), caption: "Poolside, enjoying company provided drinks" },
  { src: staticAssets("images/about/photo-05.jpg"), caption: "Somewhere the signal didn't reach" },
  { src: staticAssets("images/about/photo-06.jpg"), caption: "Weekend escape to the beer factory" },
  { src: staticAssets("images/about/photo-08.jpg"), caption: "Proof we do leave the house" },
  { src: staticAssets("images/about/photo-10.jpg"), caption: "Last minute costume party dress up" }
]

function AboutPage() {
  return (
    <Page.Root gap="2xl">
      <Page.Header emoji={SEO.emoji} title={pageTitleFromSeo(SEO.title)} subtitle={SEO.description} />

      <Page.Content>
        <div className={styles.IntroLayout}>
          <div className={styles.Intro}>
            <Typography size="small" weight="regular" className={styles.IntroText}>
              I&apos;m <strong>Gianmarco Rengucci</strong>, though most people know me as <strong>freshgiammi</strong>.
              Frontend engineer by day, open source tinkerer by night.
            </Typography>
            <Typography size="small" weight="regular" className={styles.IntroText}>
              Most machines at home run <b>GNU/Linux</b>, including a few that never volunteered for it. I&apos;ve been
              down the ricing rabbit hole for years and probably spend too much time configuring things that already
              work just fine.
            </Typography>
            <Typography size="small" weight="regular" className={styles.IntroText}>
              When I&apos;m not staring at a terminal, you&apos;ll find me out on a run untangling whatever refused to
              make sense at my desk that day, spinning records on a receiver older than half my gadgets, or looking
              after a slowly growing jungle of houseplants that are doing <s>great</s> fine despite me.
            </Typography>
            <Typography size="small" weight="regular" className={styles.IntroText}>
              This little site is home to my <Link to="/blog">blog</Link>, my <Link to="/finds">finds</Link>, and
              anything else I feel like putting out into the world.
            </Typography>

            <div className={styles.HobbyStrip}>
              {HOBBIES.map(h => (
                <Tag key={h.label} size="medium" icon={h.icon}>
                  {h.label}
                </Tag>
              ))}
            </div>
          </div>

          <div className={styles.IntroStack}>
            <PolaroidStack photos={ABOUT_PHOTOS} orientation="horizontal" />
          </div>
        </div>

        <EquipmentSection />
      </Page.Content>
    </Page.Root>
  )
}
